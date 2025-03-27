const Donation = require('../models/Donation');
const Product = require('../models/Product');
const Counter = require('../models/Counter');
const mongoose = require('mongoose');
const Meal = require('../models/Meals');         // Adjust path to your model


// ✅ Create a new donation (also creates related products and meals )
async function createDonation(req, res) {
  let newDonation; // Declare outside try block for rollback purposes
  try {
    let {
      title,
      location,
      expirationDate,
      description,
      category,
      type, // Corrected from 'Type' to match common naming conventions
      donor,
      products,
      numberOfMeals,
      status,
      meals
    } = req.body;

    // Ensure products is an array
    if (!Array.isArray(products)) {
      if (typeof products === 'string') {
        products = JSON.parse(products);
      } else {
        products = [];
      }
    }

    // Ensure meals is an array
    if (!Array.isArray(meals)) { // Corrected typo 'melas' to 'meals'
      if (typeof meals === 'string') {
        meals = JSON.parse(meals);
      } else {
        meals = [];
      }
    }

    // Filter out invalid meals (ensure all required fields are present)
    meals = meals.filter(meal =>
      meal.mealName &&
      meal.mealDescription &&
      meal.mealType
    );

    // Filter out invalid products (ensure all required fields are present)
    products = products.filter(product =>
      product.productType &&
      product.weightPerUnit &&
      product.totalQuantity &&
      product.productDescription &&
      product.status
    );

    // Create the initial donation without products or meals
    newDonation = new Donation({
      title,
      location,
      expirationDate: new Date(expirationDate),
      description,
      category: category || undefined,
      type: type || undefined, // Corrected from 'Type'
      donor,
      numberOfMeals: numberOfMeals || undefined,
      products: [], // Will be updated later with references
      meals: [],    // Will be updated later with references
      status: status || 'pending' // Default status if not provided
    });

    // Save the donation first to get its _id
    await newDonation.save();
    const donationId = newDonation._id;

    // Process meals: Assign unique IDs and link to donation
    for (let meal of meals) {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'MealId' }, // Use a different counter for meals
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      meal.id = counter.seq;
      meal.donation = donationId;
    }

    // Insert meals into the Meal collection
    const createdMeals = await Meal.insertMany(meals);
    const mealIds = createdMeals.map(meal => meal._id);

    // Update the donation's meals field with references
    newDonation.meals = mealIds;

    // Process products: Assign unique IDs and link to donation
    for (let product of products) {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'ProductId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      product.id = counter.seq;
      product.donation = donationId;
    }

    // Insert products into the Product collection
    const createdProducts = await Product.insertMany(products);
    const productIds = createdProducts.map(product => product._id);

    // Update the donation's products field with references and quantities
    newDonation.products = createdProducts.map((createdProduct, index) => ({
      product: createdProduct._id,
      quantity: products[index].totalQuantity
    }));

    // Save the updated donation
    await newDonation.save();

    res.status(201).json({ message: 'Donation created successfully', donation: newDonation });
  } catch (error) {
    // Rollback: Delete the donation if it was created but an error occurred
    if (newDonation && newDonation._id) {
      await Donation.deleteOne({ _id: newDonation._id });
    }
    console.error("Error creating donation:", error);
    res.status(400).json({
      message: "Failed to create donation",
      error: error.message || error
    });
  }
}
// ✅ Update a donation (also updates related products)
async function updateDonation(req, res) {
  try {
    const { id } = req.params;
    const { products, meals, ...donationData } = req.body;

    // Validate the donation ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid donation ID' });
    }

    // Fetch the existing donation
    const existingDonation = await Donation.findById(id);
    if (!existingDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Validate and process products if provided
    let updatedProducts = existingDonation.products;
    if (products !== undefined) {
      if (!Array.isArray(products)) {
        return res.status(400).json({ message: 'Products must be a valid array' });
      }
      for (const item of products) {
        if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
          return res.status(400).json({ message: `Invalid product ID: ${item.product}` });
        }
        if (typeof item.quantity !== 'number' || item.quantity < 0) {
          return res.status(400).json({ message: `Invalid quantity for product ${item.product}: ${item.quantity}` });
        }
      }
      updatedProducts = products;
    }

    // Validate and process meals if provided
    let updatedMealIds = existingDonation.meals;
    if (meals !== undefined) {
      if (!Array.isArray(meals)) {
        return res.status(400).json({ message: 'Meals must be a valid array' });
      }
      for (const mealId of meals) {
        if (!mongoose.Types.ObjectId.isValid(mealId)) {
          return res.status(400).json({ message: `Invalid meal ID: ${mealId}` });
        }
      }
      updatedMealIds = meals; // Use provided meal IDs
    }

    // Update the donation
    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      { ...donationData, products: updatedProducts, meals: updatedMealIds },
      { new: true }
    )
      .populate('donor')
      .populate('products.product')
      .populate('meals');

    if (!updatedDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.status(200).json({ message: 'Donation updated successfully', data: updatedDonation });
  } catch (error) {
    console.error('Error updating donation:', error);
    res.status(500).json({ message: 'Failed to update donation', error: error.message });
  }
}
// ✅ Delete a donation (also deletes related products)
// ✅ Delete a Donation
async function deleteDonation(req, res) {
  try {
      const { id } = req.params;
      const donation = await Donation.findById(id);

      if (!donation) {
          return res.status(404).json({ message: 'Donation not found' });
      }

      // Delete associated products and meals
      await Product.deleteMany({ _id: { $in: donation.products } });
      await Meal.deleteMany({ _id: { $in: donation.meals } });

      // Delete donation
      await Donation.findByIdAndDelete(id);

      res.status(200).json({ message: 'Donation and related items deleted successfully' });
  } catch (error) {
      console.error('Error deleting donation:', error);
      res.status(500).json({ message: 'Failed to delete donation', error: error.message });
  }
}

// ✅ Get Donations by Status
async function getDonationsByStatus(req, res) {
  try {
      const { status } = req.params;
      const donations = await Donation.find({ status })
          .populate('donor')
          .populate('products.product')
          .populate('meals.meal');

      if (donations.length === 0) {
          return res.status(404).json({ message: 'No donations found with this status' });
      }

      res.status(200).json(donations);
  } catch (error) {
      console.error('Error fetching donations by status:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// ✅ Get All Donations
async function getAllDonations(req, res) {
  try {
      const donations = await Donation.find({ isaPost: true }) // Only fetch posted donations
          .populate('donor')
          .populate('products.product')
          .populate('meals')
          .populate('linkedRequests');

      res.status(200).json(donations);
  } catch (error) {
      console.error('Error fetching all donations:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// ✅ Get Donation by ID
async function getDonationById(req, res) {
  try {
      const { id } = req.params;
      const donation = await Donation.findById(id)
          .populate('donor')
          .populate('products.product')
          .populate('meals');

      if (!donation) {
          return res.status(404).json({ message: 'Donation not found' });
      }

      res.status(200).json(donation);
  } catch (error) {
      console.error('Error fetching donation by ID:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// ✅ Get Donations by User ID
async function getDonationsByUserId(req, res) {
  try {
      const { userId } = req.params;
      const donations = await Donation.find({ donor: userId, isaPost: true })
          .populate('products.product')
          .populate('meals');

      if (donations.length === 0) {
          return res.status(404).json({ message: 'No donations found for this user' });
      }

      res.status(200).json(donations);
  } catch (error) {
      console.error('Error fetching donations by user ID:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// ✅ Get Donations by Date
async function getDonationsByDate(req, res) {
  try {
      const { date } = req.params;
      const donations = await Donation.find({ expirationDate: new Date(date) })
          .populate('products.product')
          .populate('meals.meal');

      if (donations.length === 0) {
          return res.status(404).json({ message: 'No donations found for this date' });
      }

      res.status(200).json(donations);
  } catch (error) {
      console.error('Error fetching donations by date:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// ✅ Get Donations by Type
async function getDonationsByType(req, res) {
  try {
      const { type } = req.params;
      const donations = await Donation.find({ Type: type }) // Ensure case consistency
          .populate('products.product')
          .populate('meals.meal');

      if (donations.length === 0) {
          return res.status(404).json({ message: 'No donations found for this type' });
      }

      res.status(200).json(donations);
  } catch (error) {
      console.error('Error fetching donations by type:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// ✅ Get Donations by Category
async function getDonationsByCategory(req, res) {
  try {
      const { category } = req.params;
      const donations = await Donation.find({ Category: category }) // Ensure case consistency
          .populate('products.product')
          .populate('meals.meal');

      if (donations.length === 0) {
          return res.status(404).json({ message: 'No donations found for this category' });
      }

      res.status(200).json(donations);
  } catch (error) {
      console.error('Error fetching donations by category:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// ✅ Get Donation by Request ID
async function getDonationByRequestId(req, res) {
  try {
      const { requestId } = req.params;
      const donations = await Donation.find({ linkedRequests: requestId }) // Should return an array
          .populate('products.product')
          .populate('meals.meal');

      if (donations.length === 0) {
          return res.status(404).json({ message: 'No donation found for this request' });
      }

      res.status(200).json(donations);
  } catch (error) {
      console.error('Error fetching donation by request ID:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = {getDonationByRequestId,getDonationsByUserId ,getAllDonations, getDonationById, getDonationsByDate, getDonationsByType, getDonationsByCategory, createDonation, updateDonation, deleteDonation , getDonationsByStatus };