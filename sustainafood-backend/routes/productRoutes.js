const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Routes
router.get('/all', productController.getAllProducts);
router.get('/:id', productController.getProductById); // Get product by ID
router.get('/donation/:idDonation', productController.getProductsByDonationId);
router.get('/status/:status', productController.getProductsByStatus);
router.post('/create', productController.createProduct);
router.put('/update/:id', productController.updateProduct);
router.delete('/delete/:id', productController.deleteProduct);

module.exports = router;
