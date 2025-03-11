const express = require('express');
const router = express.Router();
const requestNeedController = require('../controllers/requestNeedController');

router.get('/', requestNeedController.getAllRequests);
router.get('/:id', requestNeedController.getRequestById);
router.get('/recipient/:recipientId', requestNeedController.getRequestsByRecipientId);
router.get('/status/:status', requestNeedController.getRequestsByStatus);
router.post('/', requestNeedController.createRequest);
router.put('/:id', requestNeedController.updateRequest);
router.delete('/:id', requestNeedController.deleteRequest);

module.exports = router;