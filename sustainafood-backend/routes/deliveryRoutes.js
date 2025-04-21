const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController'); // New controller
// Create a new delivery
router.post('/', authMiddleware, deliveryController.createDelivery);
router.put('/:deliveryId/assign-nearest', deliveryController.assignNearestTransporter);
// Assign a transporter to a delivery (admin only)
router.put('/:deliveryId/assign', authMiddleware, deliveryController.assignTransporter);

// Get all deliveries for a specific transporter
router.get('/transporter/:transporterId', authMiddleware, deliveryController.getTransporterDeliveries);

// Update delivery status
router.put('/:deliveryId/status', authMiddleware, deliveryController.updateDeliveryStatus);

// Get all pending deliveries without an assigned transporter
router.get('/pending', authMiddleware, deliveryController.getPendingDeliveries);
// New routes for feedback
router.post('/:deliveryId/feedback', authMiddleware, feedbackController.createFeedback);
router.get('/feedbacks/transporter/:transporterId', authMiddleware, feedbackController.getTransporterFeedbacks);

module.exports = router;