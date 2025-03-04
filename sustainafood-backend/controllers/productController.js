const Product = require('../models/Product'); // Ensure the correct path to the Product model
const Counter = require('../models/Counter');

// ✅ Get all products
async function getAllProducts  (req, res)  {
    try {
        const products = await Product.find().populate('iddonation'); // Populate donation details if needed
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Get product by ID
async function getProductById  (req, res) {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate('iddonation');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Get products by Donation ID
async function getProductsByDonationId (req, res)  {
    try {
        const { idDonation } = req.params;
        const products = await Product.find({ iddonation: idDonation });

        if (!products.length) {
            return res.status(404).json({ message: 'No products found for this donation' });
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Get products by Status
async function getProductsByStatus (req, res)  {
    try {
        const { status } = req.params;
        const products = await Product.find({ status });

        if (!products.length) {
            return res.status(404).json({ message: 'No products found with this status' });
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Create a new product
async function createProduct  (req, res)  {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', newProduct });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create product', error });
    }
};

// ✅ Update a product by ID
async function updateProduct (req, res)  {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update product', error });
    }
};

// ✅ Delete a product by ID
async function deleteProduct  (req, res)  {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product', error });
    }
};
module.exports = { getAllProducts, getProductById, getProductsByDonationId, getProductsByStatus, createProduct, updateProduct, deleteProduct };