const Donation = require('../models/Donation');
const Product = require('../models/Product'); // Import Product model
const Counter = require('../models/Counter');


// ✅ Get all donations
async function getAllDonations (req, res)  {
    try {
        const donations = await Donation.find().populate('donor').populate('products');
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Get donation by ID
async function getDonationById(req, res) {
    try {
        const { id } = req.params;
       

        const donation = await Donation.findById(id)
            .populate('donor')
            .populate('products');
            console.log(donation);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        res.status(200).json(donation);
    } catch (error) {
        console.error("Error fetching donation:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// ✅ Get donations by User ID
async function getDonationsByUserId(req, res)  {
    try {
        const { userId } = req.params;
        const donations = await Donation.find({ donor: userId }).populate('products');

        if (!donations.length) {
            return res.status(404).json({ message: 'No donations found for this user' });
        }

        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Get donations by Date
async function getDonationsByDate(req, res)  {
    try {
        const { date } = req.params;
        const donations = await Donation.find({ expirationDate: new Date(date) }).populate('products');

        if (!donations.length) {
            return res.status(404).json({ message: 'No donations found for this date' });
        }

        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Get donations by Type (donation/request)
async function getDonationsByType (req, res)  {
    try {
        const { type } = req.params;
        const donations = await Donation.find({ Type: type }).populate('products');

        if (!donations.length) {
            return res.status(404).json({ message: 'No donations found for this type' });
        }

        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Get donations by Category (Prepared_Meals, Packaged_Products)
async function getDonationsByCategory (req, res)  {
    try {
        const { category } = req.params;
        const donations = await Donation.find({ Category: category }).populate('products');

        if (!donations.length) {
            return res.status(404).json({ message: 'No donations found for this category' });
        }

        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Create a new donation (also creates related products)
async function createDonation(req, res) {
    console.log("body donation back", req.body);
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
        //delivery,
        status
      } = req.body;
      
      // Ensure products is an array
      if (!Array.isArray(products)) {
        if (typeof products === 'string') {
          products = JSON.parse(products);
        } else {
          products = [];
        }
      }
      
      // Optional: filter out empty products
      products = products.filter(product =>
        product.productType &&
        product.weightPerUnit &&
        product.totalQuantity &&
        product.productDescription &&
        product.status
      );
      
      // Create the donation without products first (to get its _id)
      const newDonation = new Donation({
        title,
        location,
        expirationDate: new Date(expirationDate),
        description,
        category: category ? category : undefined,
        type: Type ? Type : undefined,
        donor,
        numberOfMeals,
        products: [], // Initially empty
       // delivery,
        status
      });
      
      await newDonation.save(); // Save to obtain the donation _id
      const donationId = newDonation._id;
      
      // For each product, assign the donation ID and an auto-incremented product ID
      for (let product of products) {
        const counter = await Counter.findOneAndUpdate(
          { _id: 'ProductId' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        product.id = counter.seq;
        product.donation = donationId;
      }
      
      // Create the products in the database
      const createdProducts = await Product.insertMany(products);
      const productIds = createdProducts.map(product => product._id);
      
      // Update the donation with the created product IDs
      newDonation.products = productIds;
      await newDonation.save();
      
      res.status(201).json({ message: 'Donation created successfully', newDonation });
    } catch (error) {
      console.error("Donation Creation Error:", error);
      res.status(400).json({
        message: "Failed to create donation",
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
module.exports = {getDonationsByUserId, getAllDonations, getDonationById, getDonationsByDate, getDonationsByType, getDonationsByCategory, createDonation, updateDonation, deleteDonation };