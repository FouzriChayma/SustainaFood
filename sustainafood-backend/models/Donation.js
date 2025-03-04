const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter');

// Define Enums
const Delivery = {
    PICKUP: 'pickup', 
    SAME_DAY: 'same_day',
    STANDARD: 'standard',
    OVERNIGHT: 'overnight',
    EXPRESS: 'express'
};
Object.freeze(Delivery);

const Type = {
    DONATION: 'donation',
    REQUEST: 'request'
};
Object.freeze(Type);

const Category = {
    PREPARED_MEALS: 'Prepared_Meals',
    PACKAGED_PRODUCTS: 'Packaged_Products'
};
Object.freeze(Category);

// Define Schema
const donationSchema = new Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    expirationDate: { type: Date, required: true },
    description: { type: String },
    Category: { type: String, enum: Object.values(Category), required: true },
    Type: { type: String, enum: Object.values(Type), required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    id: { type: Number }, // Auto-incremented custom ID
    products: [{ type: Schema.Types.ObjectId, ref: 'Product', required: true }], // List of products
    delivery: { type: String, enum: Object.values(Delivery), required: true },
    status: { type: String, enum: ['pending', 'delivered', 'cancelled'], required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Pre-save hook to auto-increment `id` before saving a new donation
donationSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'DonationId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.id = counter.seq;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

// Create and export the Donation model
const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation;
