const express = require('express');
const router = express.Router();
const contactController = require('../controllers/ContactSubmissionController');

router.post('/contact', contactController.submitContactForm);
router.get('/contact/submissions', contactController.getAllSubmissions);

module.exports = router;