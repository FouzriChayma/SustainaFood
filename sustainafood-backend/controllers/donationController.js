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
      type,
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
    if (!Array.isArray(meals)) {
      if (typeof meals === 'string') {
        meals = JSON.parse(meals);
      } else {
        meals = [];
      }
    }

    // Validate and filter meals (ensure all required fields are present)
    const validMeals = meals.map(meal => ({
      mealName: meal.mealName || undefined,
      mealDescription: meal.mealDescription || undefined,
      mealType: meal.mealType || undefined,
      quantity: parseInt(meal.quantity) || undefined
    })).filter(meal =>
      meal.mealName &&
      meal.mealDescription &&
      meal.mealType &&
      meal.quantity > 0
    );

    // Validate and filter products (ensure all required fields are present)
    const validProducts = products.map(product => ({
      productType: product.productType || undefined,
      weightPerUnit: parseFloat(product.weightPerUnit) || undefined,
      weightUnit: product.weightUnit || 'kg',
      totalQuantity: parseInt(product.totalQuantity) || undefined,
      productDescription: product.productDescription || undefined,
      status: product.status || 'available'
    })).filter(product =>
      product.productType &&
      product.weightPerUnit > 0 &&
      product.totalQuantity > 0 &&
      product.productDescription &&
      product.status
    );

    // Validate required fields
    if (!title || !location || !expirationDate || !description || !donor) {
      throw new Error('Missing required fields: title, location, expirationDate, description, or donor');
    }

    if (category === 'prepared_meals' && validMeals.length === 0) {
      throw new Error('At least one valid meal is required for prepared_meals category');
    }

    // Calculate numberOfMeals if not provided or if it needs to be corrected
    const calculatedNumberOfMeals = category === 'prepared_meals'
      ? validMeals.reduce((sum, meal) => sum + meal.quantity, 0)
      : undefined;

    // Create the donation object
    newDonation = new Donation({
      title,
      location,
      expirationDate: new Date(expirationDate),
      description,
      category: category || 'prepared_meals',
      type: type || 'donation',
      donor,
      meals: category === 'prepared_meals' ? validMeals : [],
      numberOfMeals: category === 'prepared_meals' ? (numberOfMeals || calculatedNumberOfMeals) : undefined,
      products: [],
      status: status || 'pending'
    });

    // Process products: Create Product documents and link them
    if (validProducts.length > 0) {
      for (let product of validProducts) {
        const counter = await Counter.findOneAndUpdate(
          { _id: 'ProductId' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        product.id = counter.seq;
        product.donation = newDonation._id; // Link to donation
      }

      const createdProducts = await Product.insertMany(validProducts);
      newDonation.products = createdProducts.map((createdProduct, index) => ({
        product: createdProduct._id,
        quantity: validProducts[index].totalQuantity
      }));
    }

    // Save the donation with embedded meals and product references
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
    const { id } = req.params; // Donation ID
    const { products, meals, ...donationData } = req.body;

    // **Validate Donation ID**
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid donation ID' });
    }

    // **Fetch Existing Donation**
    const existingDonation = await Donation.findById(id).populate('meals.meal');
    if (!existingDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // **Process Products**
    let updatedProducts = existingDonation.products || [];
    if (products !== undefined) {
      if (!Array.isArray(products)) {
        return res.status(400).json({ message: 'Products must be an array' });
      }
      updatedProducts = [];
      for (const item of products) {
        if (item.quantity !== undefined && (typeof item.quantity !== 'number' || item.quantity < 0)) {
          return res.status(400).json({ message: 'Invalid quantity in products array' });
        }

        let productId;
        if (item.id) {
          const product = await Product.findOne({ id: item.id });
          if (!product) {
            return res.status(404).json({ message: `Product with id ${item.id} not found` });
          }
          product.name = item.name ?? product.name;
          product.productDescription = item.productDescription ?? product.productDescription;
          product.productType = item.productType ?? product.productType;
          product.weightPerUnit = item.weightPerUnit ?? product.weightPerUnit;
          product.weightUnit = item.weightUnit ?? product.weightUnit;
          product.totalQuantity = item.totalQuantity ?? product.totalQuantity;
          product.status = item.status ?? product.status;
          await product.save();
          productId = product._id;
        } else {
          const counter = await Counter.findOneAndUpdate(
            { _id: 'ProductId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
          );
          const newProduct = new Product({
            id: counter.seq,
            name: item.name,
            productDescription: item.productDescription,
            productType: item.productType,
            weightPerUnit: item.weightPerUnit,
            weightUnit: item.weightUnit,
            totalQuantity: item.totalQuantity,
            status: item.status || 'available',
            donation: id
          });
          await newProduct.save();
          productId = newProduct._id;
        }
        updatedProducts.push({ product: productId, quantity: item.quantity || 1 });
      }
    }

    // **Process Meals**
    let updatedMeals = [];
    if (meals !== undefined) {
      if (!Array.isArray(meals)) {
        return res.status(400).json({ message: 'Meals must be an array' });
      }

      // **Identify Meals to Delete**
      const existingMealIds = existingDonation.meals.map(mealEntry => mealEntry.meal.id.toString());
      const updatedMealIds = meals
        .filter(item => item.id)
        .map(item => item.id.toString());

      const mealsToDelete = existingMealIds.filter(mealId => !updatedMealIds.includes(mealId));
      if (mealsToDelete.length > 0) {
        await Meal.deleteMany({ id: { $in: mealsToDelete } });
      }

      // **Process Updated/New Meals**
      updatedMeals = [];
      for (const item of meals) {
        if (item.quantity === undefined || typeof item.quantity !== 'number' || item.quantity < 1) {
          return res.status(400).json({ message: 'Invalid or missing quantity in meals array' });
        }

        let mealId;
        if (item.id) {
          const meal = await Meal.findOne({ id: item.id });
          if (!meal) {
            return res.status(404).json({ message: `Meal with id ${item.id} not found` });
          }
          meal.mealName = item.mealName ?? meal.mealName;
          meal.mealDescription = item.mealDescription ?? meal.mealDescription;
          meal.mealType = item.mealType ?? meal.mealType;
          meal.quantity = item.quantity; // Update the quantity in the Meal document
          await meal.save();
          mealId = meal._id;
        } else {
          const counter = await Counter.findOneAndUpdate(
            { _id: 'mealId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
          );
          const newMeal = new Meal({
            id: counter.seq,
            mealName: item.mealName,
            mealDescription: item.mealDescription,
            mealType: item.mealType,
            quantity: item.quantity,
            donation: id
          });
          await newMeal.save();
          mealId = newMeal._id;
        }
        updatedMeals.push({ meal: mealId, quantity: item.quantity });
      }
    } else {
      updatedMeals = existingDonation.meals.map(mealEntry => ({
        meal: mealEntry.meal._id,
        quantity: mealEntry.quantity,
      }));
    }

    // **Update Donation Fields**
    const allowedFields = [
      'title',
      'location',
      'expirationDate',
      'type',
      'category',
      'description',
      'numberOfMeals'
    ];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (donationData[field] !== undefined) {
        updateData[field] = donationData[field];
      }
    });

    // **Save Updated Donation**
    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      { ...updateData, products: updatedProducts, meals: updatedMeals },
      { new: true }
    )
      .populate('donor')
      .populate('products.product')
      .populate('meals.meal');

    if (!updatedDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // **Success Response**
    res.status(200).json({
      message: 'Donation updated successfully',
      data: updatedDonation
    });
  } catch (error) {
    console.error('Error updating donation:', error);
    res.status(500).json({
      message: 'Failed to update donation',
      error: error.message
    });
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
          .populate('meals.meal')
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
          .populate('meals.meal');

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
          .populate('meals.meal');

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