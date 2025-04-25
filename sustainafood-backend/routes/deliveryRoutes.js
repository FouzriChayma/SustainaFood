const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const feedbackController = require('../controllers/feedbackController'); // New controller
// Create a new delivery
router.post('/',  deliveryController.createDelivery);
router.get('/',  deliveryController.getAllDeliveries);
router.get('/:deliveryId',  deliveryController.getDeliveriesById);
router.put('/:deliveryId/assign-nearest', deliveryController.assignNearestTransporter);
// Assign a transporter to a delivery (admin only)
router.put('/:deliveryId/assign', deliveryController.assignTransporter);

// Get all deliveries for a specific transporter
router.get('/transporter/:transporterId',  deliveryController.getTransporterDeliveries);

// Update delivery status
router.put('/:deliveryId/status',  deliveryController.updateDeliveryStatus);

// Get all pending deliveries without an assigned transporter
router.get('/pending',  deliveryController.getPendingDeliveries);
// New routes for feedback
router.post('/:deliveryId/feedback',  feedbackController.createFeedback);
router.get('/feedbacks/transporter/:transporterId', feedbackController.getTransporterFeedbacks);
router.get('/transporter/:transporterId', deliveryController.getDeliveriesByTransporter);
module.exports = router;