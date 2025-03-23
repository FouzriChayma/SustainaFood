const Donation = require('../models/Donation');
const Product = require('../models/Product'); // Import Product model
const Counter = require('../models/Counter');
const mongoose = require('mongoose');

// ✅ Get all donations
async function getAllDonations(req, res) {
    try {
        const donations = await Donation.find()
            .populate('donor')
            .populate('products.product'); // Changé de 'products' à 'products.product'
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Get donation by ID
async function getDonationById(req, res) {
    try {
        const { id } = req.params;
        const donation = await Donation.findById(id)
            .populate('donor')
            .populate('products.product'); // Changé de 'products' à 'products.product'
        console.log(donation);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        res.status(200).json(donation);
    } catch (error) {
        console.error("Error fetching donation:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// ✅ Get donations by User ID
async function getDonationsByUserId(req, res) {
    try {
        const { userId } = req.params;
        const donations = await Donation.find({ donor: userId })
            .populate('products.product'); // Changé de 'products' à 'products.product'
        if (!donations.length) {
            return res.status(404).json({ message: 'No donations found for this user' });
        }
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Get donations by Date
async function getDonationsByDate(req, res) {
    try {
        const { date } = req.params;
        const donations = await Donation.find({ expirationDate: new Date(date) })
            .populate('products.product'); // Changé de 'products' à 'products.product'
        if (!donations.length) {
            return res.status(404).json({ message: 'No donations found for this date' });
        }
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}
// ✅ Get donations by Type (donation/request)
async function getDonationsByType(req, res) {
    try {
        const { type } = req.params;
        const donations = await Donation.find({ Type: type })
            .populate('products.product'); // Changé de 'products' à 'products.product'
        if (!donations.length) {
            return res.status(404).json({ message: 'No donations found for this type' });
        }
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

async function getDonationsByCategory(req, res) {
    try {
        const { category } = req.params;
        const donations = await Donation.find({ Category: category })
            .populate('products.product'); // Changé de 'products' à 'products.product'
        if (!donations.length) {
            return res.status(404).json({ message: 'No donations found for this category' });
        }
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}
async function getDonationByRequestId(req, res) {
    try {
      const { requestId } = req.params;
      const donation = await Donation.find({ linkedRequests: requestId }) // Use linkedRequests field
        .populate('products.product'); // Populate nested product details
  
      if (!donation) {
        return res.status(404).json({ message: 'No donation found for this request' });
      }
  
      res.status(200).json(donation); // Return the donation data
    } catch (error) {
      console.error('Error fetching donation by request ID:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
// ✅ Create a new donation (also creates related products)
async function createDonation(req, res) {
    try {
      let {
        title,
        location,
        expirationDate,
        description,
        category,
        Type,
        donor,
        products,
        numberOfMeals,
        status
      } = req.body;
  
      // Vérifier que products est un tableau
      if (!Array.isArray(products)) {
        if (typeof products === 'string') {
          products = JSON.parse(products);
        } else {
          products = [];
        }
      }
  
      // Filtrer les produits invalides
      products = products.filter(product =>
        product.productType &&
        product.weightPerUnit &&
        product.totalQuantity &&
        product.productDescription &&
        product.status
      );
  
      // Créer le don initial sans produits
      const newDonation = new Donation({
        title,
        location,
        expirationDate: new Date(expirationDate),
        description,
        category: category || undefined,
        type: Type || undefined,
        donor,
        numberOfMeals,
        products: [],
        status
      });
  
      await newDonation.save();
      const donationId = newDonation._id;
  
      // Assigner un identifiant unique aux produits et les lier au don
      for (let product of products) {
        const counter = await Counter.findOneAndUpdate(
          { _id: 'ProductId' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        product.id = counter.seq;
        product.donation = donationId;
      }
  
      // Insérer les produits dans la collection Product
      const createdProducts = await Product.insertMany(products);
      const productIds = createdProducts.map(product => product._id);
  
      // Mettre à jour le champ products du don avec les références et totalQuantity
      newDonation.products = createdProducts.map((createdProduct, index) => ({
        product: createdProduct._id,
        quantity: products[index].totalQuantity
      }));
  
      // Sauvegarder les modifications du don
      await newDonation.save();
  
      res.status(201).json({ message: 'Donation created successfully', newDonation });
    } catch (error) {
      // Gestion des erreurs : supprimer le don si une erreur survient après sa création
      if (newDonation) {
        await Donation.deleteOne({ _id: newDonation._id });
      }
      console.error("Erreur lors de la création du don :", error);
      res.status(400).json({
        message: "Échec de la création du don",
        error: error.message || error
      });
    }
  }
  
  


// ✅ Update a donation (also updates related products)
async function updateDonation (req, res) {
    try {
        const { id } = req.params;
        const { products, ...donationData } = req.body;

        // Update donation details
        const updatedDonation = await Donation.findByIdAndUpdate(id, donationData, { new: true });

        if (!updatedDonation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Update or replace products
        if (products) {
            await Product.deleteMany({ _id: { $in: updatedDonation.products } }); // Remove old products
            const newProducts = await Product.insertMany(products);
            updatedDonation.products = newProducts.map(product => product._id);
            await updatedDonation.save();
        }

        res.status(200).json({ message: 'Donation updated successfully', updatedDonation });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update donation', error });
    }
};

// ✅ Delete a donation (also deletes related products)
async function deleteDonation  (req, res) {
    try {
        const { id } = req.params;
        const donation = await Donation.findById(id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Delete associated products
        await Product.deleteMany({ _id: { $in: donation.products } });

        // Delete donation
        await Donation.findByIdAndDelete(id);

        res.status(200).json({ message: 'Donation and related products deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete donation', error });
    }
   

};
module.exports = {getDonationByRequestId,getDonationsByUserId ,getAllDonations, getDonationById, getDonationsByDate, getDonationsByType, getDonationsByCategory, createDonation, updateDonation, deleteDonation };