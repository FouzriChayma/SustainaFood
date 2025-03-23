const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middleware/auth'); // Your authentication middleware
const requestNeedController = require('../controllers/requestNeedController');

router.get('/', requestNeedController.getAllRequests);
router.get('/:id', requestNeedController.getRequestById);
router.get('/recipient/:recipientId', requestNeedController.getRequestsByRecipientId);
router.get('/status/:status', requestNeedController.getRequestsByStatus);
router.post('/', requestNeedController.createRequest);
router.put('/:id', requestNeedController.updateRequest);
router.delete('/:id', requestNeedController.deleteRequest);
router.post('/addDonationToRequest/:requestId/donations',authMiddleware, requestNeedController.addDonationToRequest);

module.exports = router;