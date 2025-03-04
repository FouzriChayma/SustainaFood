const express = require('express');
const multer = require('multer');
const upload = multer(); // Pour parser les champs sans fichier
const router = express.Router();
const donationController = require('../controllers/donationController');

// ✅ Get all donations
router.get('/', donationController.getAllDonations);

// ✅ Get donation by ID
router.get('/:id', donationController.getDonationById);

// ✅ Get donations by User ID
router.get('/user/:userId', donationController.getDonationsByUserId);

// ✅ Get donations by Date
router.get('/date/:date', donationController.getDonationsByDate);

// ✅ Get donations by Type (donation/request)
router.get('/type/:type', donationController.getDonationsByType);

// ✅ Get donations by Category (Prepared_Meals, Packaged_Products)
router.get('/category/:category', donationController.getDonationsByCategory);

// ✅ Create a new donation (with associated products)
// Ajout de "upload.none()" pour parser les champs du FormData
router.post('/', upload.none(), donationController.createDonation);

// ✅ Update a donation (and update associated products)
router.put('/:id', donationController.updateDonation);

// ✅ Delete a donation (and delete associated products)
router.delete('/:id', donationController.deleteDonation);

module.exports = router;
