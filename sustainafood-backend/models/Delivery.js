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
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'delivered', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Delivery', deliverySchema);