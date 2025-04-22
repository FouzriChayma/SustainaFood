// deliveryController.js
const Delivery = require('../models/Delivery');
const User = require('../models/User');
const DonationTransaction = require('../models/DonationTransaction');
const Donation = require('../models/Donation');
const { createNotification } = require('./notificationController');

// Valid delivery statuses
const VALID_STATUSES = ['pending', 'picked_up', 'in_progress', 'delivered', 'failed'];

exports.createDelivery = async (req, res) => {
  try {
    const { donationTransaction, pickupAddress, deliveryAddress } = req.body;
    if (!donationTransaction || !pickupAddress || !deliveryAddress) {
      return res.status(400).json({ message: 'Donation transaction ID, pickupAddress, and deliveryAddress are required' });
    }

    const transaction = await DonationTransaction.findById(donationTransaction)
      .populate('donor')
      .populate('recipient');
    if (!transaction) {
      return res.status(404).json({ message: 'Donation transaction not found' });
    }

    const delivery = new Delivery({
      donationTransaction,
      pickupAddress,
      deliveryAddress,
      status: 'pending',
    });

    await delivery.save();

    // Notifier le donateur et le bénéficiaire
    await createNotification({
      body: {
        sender: transaction.recipient._id,
        receiver: transaction.donor._id,
        message: `Une livraison a été créée pour votre don. Statut : En attente.`,
      },
    }, { status: () => ({ json: () => {} }) });

    await createNotification({
      body: {
        sender: transaction.donor._id,
        receiver: transaction.recipient._id,
        message: `Votre demande est en cours de livraison. Statut : En attente.`,
      },
    }, { status: () => ({ json: () => {} }) });

    res.status(201).json({ data: delivery });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la livraison', error: error.message });
  }
};

exports.assignTransporter = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { transporterId, force = false } = req.body;

    const transporter = await User.findById(transporterId).select('role');
    if (!transporter || transporter.role !== 'transporter') {
      return res.status(400).json({ message: 'Invalid transporter' });
    }

    const delivery = await Delivery.findById(deliveryId)
      .populate('donationTransaction');
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.transporter && !force) {
      return res.status(400).json({ 
        message: 'Transporter already assigned. Use force=true to overwrite.' 
      });
    }

    delivery.transporter = transporterId;
    await delivery.save();

    const transaction = await DonationTransaction.findById(delivery.donationTransaction._id)
      .populate('donor')
      .populate('recipient');

    // Notifier le chauffeur
    await createNotification({
      body: {
        sender: transaction.recipient._id,
        receiver: transporterId,
        message: `Vous avez été assigné à une livraison. Récupérez à ${delivery.pickupAddress} et livrez à ${delivery.deliveryAddress}.`,
      },
    }, { status: () => ({ json: () => {} }) });

    // Notifier le donateur et le bénéficiaire
    await createNotification({
      body: {
        sender: transporterId,
        receiver: transaction.donor._id,
        message: `Un chauffeur a été assigné pour votre don. Statut : En attente.`,
      },
    }, { status: () => ({ json: () => {} }) });

    await createNotification({
      body: {
        sender: transporterId,
        receiver: transaction.recipient._id,
        message: `Un chauffeur a été assigné pour votre demande. Statut : En attente.`,
      },
    }, { status: () => ({ json: () => {} }) });

    res.status(200).json({ data: delivery });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'assignation du transporteur', error: error.message });
  }
};

exports.assignNearestTransporter = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId)
      .populate({
        path: 'donationTransaction',
        populate: { path: 'donation' },
      });
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.transporter) {
      return res.status(400).json({ message: 'Transporter already assigned' });
    }

    const pickupLocation = delivery.donationTransaction.donation.location;
    if (!pickupLocation || !pickupLocation.coordinates) {
      return res.status(400).json({ message: 'Donation location is missing' });
    }

    const transporters = await User.find({ role: 'transporter', isAvailable: true });
    let closestTransporter = null;
    let minDistance = Infinity;

    const calculateDistance = (loc1, loc2) => {
      const [lng1, lat1] = loc1.coordinates;
      const [lng2, lat2] = loc2.coordinates;
      const R = 6371e3; // Rayon de la Terre en mètres
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lng2 - lng1) * Math.PI) / 180;
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance en mètres
    };

    for (const transporter of transporters) {
      if (transporter.currentLocation && transporter.currentLocation.coordinates[0] !== 0) {
        const distance = calculateDistance(pickupLocation, transporter.currentLocation);
        if (distance < minDistance) {
          minDistance = distance;
          closestTransporter = transporter;
        }
      }
    }

    if (!closestTransporter) {
      return res.status(404).json({ message: 'Aucun chauffeur disponible à proximité' });
    }

    delivery.transporter = closestTransporter._id;
    await delivery.save();

    await User.findByIdAndUpdate(closestTransporter._id, { isAvailable: false });

    const transaction = await DonationTransaction.findById(delivery.donationTransaction._id)
      .populate('donor')
      .populate('recipient');

    // Notifier le chauffeur
    await createNotification({
      body: {
        sender: transaction.recipient._id,
        receiver: closestTransporter._id,
        message: `Vous avez été assigné à une livraison. Récupérez à ${delivery.pickupAddress} et livrez à ${delivery.deliveryAddress}.`,
      },
    }, { status: () => ({ json: () => {} }) });

    // Notifier le donateur et le bénéficiaire
    await createNotification({
      body: {
        sender: closestTransporter._id,
        receiver: transaction.donor._id,
        message: `Un chauffeur a été assigné pour votre don. Statut : En attente.`,
      },
    }, { status: () => ({ json: () => {} }) });

    await createNotification({
      body: {
        sender: closestTransporter._id,
        receiver: transaction.recipient._id,
        message: `Un chauffeur a été assigné pour votre demande. Statut : En attente.`,
      },
    }, { status: () => ({ json: () => {} }) });

    res.status(200).json({ data: delivery });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'assignation du transporteur', error: error.message });
  }
};

exports.getTransporterDeliveries = async (req, res) => {
  try {
    const { transporterId } = req.params;
    
    const deliveries = await Delivery.find({ transporter: transporterId })
      .populate({
        path: 'donationTransaction',
        select: 'donation requestNeed',
        populate: { 
          path: 'donation', 
          select: 'title donor category' 
        },
      });

    const validDeliveries = deliveries.filter(d => d.donationTransaction);
    if (validDeliveries.length < deliveries.length) {
      console.warn(`Found ${deliveries.length - validDeliveries.length} deliveries with missing donationTransaction`);
    }

    res.status(200).json({ data: validDeliveries || [] });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
      });
    }

    const delivery = await Delivery.findById(deliveryId)
      .populate('donationTransaction');
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    const oldStatus = delivery.status;
    delivery.status = status;
    await delivery.save();

    const transaction = await DonationTransaction.findById(delivery.donationTransaction._id)
      .populate('donor')
      .populate('recipient');

    if (status === 'delivered') {
      transaction.status = 'completed';
      await transaction.save();

      const donation = await Donation.findById(transaction.donation);
      donation.status = 'fulfilled';
      await donation.save();

      await User.findByIdAndUpdate(delivery.transporter, { isAvailable: true });
    } else if (status === 'failed') {
      transaction.status = 'rejected';
      await transaction.save();

      await User.findByIdAndUpdate(delivery.transporter, { isAvailable: true });
    }

    const message = `Mise à jour de la livraison : Statut changé de ${oldStatus} à ${status}.`;
    await createNotification({
      body: {
        sender: delivery.transporter,
        receiver: transaction.donor._id,
        message,
      },
    }, { status: () => ({ json: () => {} }) });

    await createNotification({
      body: {
        sender: delivery.transporter,
        receiver: transaction.recipient._id,
        message,
      },
    }, { status: () => ({ json: () => {} }) });

    await createNotification({
      body: {
        sender: transaction.donor._id,
        receiver: delivery.transporter,
        message: `Statut de livraison mis à jour : ${status}.`,
      },
    }, { status: () => ({ json: () => {} }) });

    res.status(200).json({ data: delivery });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error: error.message });
  }
};

exports.getPendingDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ status: 'pending', transporter: null })
      .populate({
        path: 'donationTransaction',
        select: 'donation requestNeed',
        populate: [
          { 
            path: 'donation', 
            select: 'title donor category', 
            populate: { path: 'donor', select: 'name email' } 
          },
          { 
            path: 'requestNeed', 
            select: 'recipient', 
            populate: { path: 'recipient', select: 'name email' } 
          },
        ],
      });

    const validDeliveries = deliveries.filter(d => d.donationTransaction);
    if (validDeliveries.length < deliveries.length) {
      console.warn(`Found ${deliveries.length - validDeliveries.length} deliveries with missing donationTransaction`);
    }

    res.status(200).json({ data: validDeliveries || [] });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getDeliveriesByTransporter = async (req, res) => {
  try {
    const { transporterId } = req.params;
    const { status } = req.query;

    // Validate transporter
    const transporter = await User.findById(transporterId).select('role');
    if (!transporter || transporter.role !== 'transporter') {
      return res.status(400).json({ message: 'Invalid transporter' });
    }

    // Build query
    const query = { transporter: transporterId };
    if (status && VALID_STATUSES.includes(status)) {
      query.status = status;
    }

    // Fetch deliveries
    const deliveries = await Delivery.find(query)
      .populate({
        path: 'donationTransaction',
        select: 'donation requestNeed status',
        populate: [
          {
            path: 'donation',
            select: 'title donor category location',
            populate: { path: 'donor', select: 'name email' },
          },
          {
            path: 'requestNeed',
            select: 'recipient',
            populate: { path: 'recipient', select: 'name email' },
          },
        ],
      })
      .sort({ createdAt: -1 }); // Sort by most recent first

    // Filter out invalid deliveries and log warnings
    const validDeliveries = deliveries.filter(d => d.donationTransaction);
    if (validDeliveries.length < deliveries.length) {
      console.warn(
        `Found ${deliveries.length - validDeliveries.length} deliveries with missing donationTransaction for transporter ${transporterId}`
      );
    }

    // Return response
    res.status(200).json({ data: validDeliveries || [] });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des livraisons', error: error.message });
  }
};