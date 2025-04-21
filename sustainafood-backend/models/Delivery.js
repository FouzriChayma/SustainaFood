// models/Delivery.js
const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  donationTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationTransaction',
    required: true,
  },
  transporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pickupAddress: { type: String, required: true }, // Adresse lisible du donateur
  deliveryAddress: { type: String, required: true }, // Adresse lisible du bénéficiaire
  status: {
    type: String,
    enum: ['pending', 'picked_up', 'in_progress', 'delivered', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ajouter un hook pour mettre à jour updatedAt lors des modifications
deliverySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Delivery', deliverySchema);