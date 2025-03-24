const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter');

const Category = {
    PREPARED_MEALS: 'prepared_meals',
    PACKAGED_PRODUCTS: 'packaged_products'
};
Object.freeze(Category);

const Status = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    PARTIALLY_FULFILLED: 'partially_fulfilled',
    FULFILLED: 'fulfilled',
    CANCELLED: 'cancelled'
};
Object.freeze(Status);

const donationSchema = new Schema({
    id: { type: Number, unique: true },
    donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, minlength: 3, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    category: { type: String, enum: Object.values(Category), required: true },
    products: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to Product
        quantity: { type: Number, required: true, min: 0 } // Donated quantity
    }],
    numberOfMeals: {
        type: Number,
        required: [
            function() { return this.category === 'prepared_meals'; },
            'Number of meals is required for prepared meals'
        ],
        min: [1, 'Number of meals cannot be negative'],
        validate: {
            validator: Number.isInteger,
            message: 'Number of meals must be an integer'
        }
    },
    location: { type: String, required: true },
    expirationDate: {
        type: Date,
        required: true,
        validate: {
            validator: (date) => date > new Date(),
            message: 'Expiration date must be in the future'
        }
    },
    status: { type: String, enum: Object.values(Status), default: Status.PENDING, required: true },
    linkedRequests: [{ type: Schema.Types.ObjectId, ref: 'RequestNeed' }]
}, {
    timestamps: true
});

donationSchema.index({ status: 1 });
donationSchema.index({ category: 1 });
donationSchema.index({ expirationDate: 1 });

donationSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'DonationId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.id = counter.seq;
        } catch (err) {
            return next(new Error('Failed to generate donation ID: ' + err.message));
        }
    }
    next();
});

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation;