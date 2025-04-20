const Delivery = require('../models/Delivery');
const User = require('../models/User');

// Valid delivery statuses
const VALID_STATUSES = ['pending', 'in_progress', 'delivered', 'failed'];

exports.createDelivery = async (req, res) => {
  try {
    const { donationTransaction } = req.body;
    if (!donationTransaction) {
      return res.status(400).json({ message: 'Donation transaction ID is required' });
    }

    const delivery = new Delivery({
      donationTransaction,
      status: 'pending',
    });

    await delivery.save();
    res.status(201).json({ data: delivery });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la livraison', error: error.message });
  }
};

exports.assignTransporter = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { transporterId, force = false } = req.body;

    // Validate transporter
    const transporter = await User.findById(transporterId).select('role');
    if (!transporter || transporter.role !== 'transporter') {
      return res.status(400).json({ message: 'Invalid transporter' });
    }

    // Find delivery
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Check if transporter is already assigned
    if (delivery.transporter && !force) {
      return res.status(400).json({ 
        message: 'Transporter already assigned. Use force=true to overwrite.' 
      });
    }

    // Assign transporter
    delivery.transporter = transporterId;
    await delivery.save();

    res.status(200).json({ data: delivery });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'assignation du transporteur', error: error.message });
  }
};

exports.getTransporterDeliveries = async (req, res) => {
  try {
    const { transporterId } = req.params;
    
    // Fetch deliveries with selective population
    const deliveries = await Delivery.find({ transporter: transporterId })
      .populate({
        path: 'donationTransaction',
        select: 'donation requestNeed',
        populate: { 
          path: 'donation', 
          select: 'title donor category' 
        },
      });

    // Filter out deliveries with missing donationTransaction
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

    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
      });
    }

    // Find delivery
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Update status
    delivery.status = status;
    await delivery.save();

    res.status(200).json({ data: delivery });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error: error.message });
  }
};

exports.getPendingDeliveries = async (req, res) => {
  try {
    // Fetch pending deliveries with selective population
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

    // Filter out deliveries with missing donationTransaction
    const validDeliveries = deliveries.filter(d => d.donationTransaction);
    if (validDeliveries.length < deliveries.length) {
      console.warn(`Found ${deliveries.length - validDeliveries.length} deliveries with missing donationTransaction`);
    }

    res.status(200).json({ data: validDeliveries || [] });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};