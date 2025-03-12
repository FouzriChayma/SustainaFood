const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter'); // Assumes a Counter model for auto-incrementing IDs

// Define the status enum
const RequestStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    FULFILLED: 'fulfilled'
};
Object.freeze(RequestStatus);
const Category = {
    PREPARED_MEALS: 'prepared_meals',
    PACKAGED_PRODUCTS: 'packaged_products'
};
Object.freeze(Category);
// Define the ProductRequest subdocument schema (embedded in RequestNeed)
const productRequestSchema = new Schema({
    product: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product', 
        required: false 
    },
    quantity: { 
        type: Number, 
        required: true, 
        min: [1, 'Quantity must be at least 1'],
        validate: {
            validator: Number.isInteger,
            message: 'Quantity must be an integer'
        }
    }
});

// Define the RequestNeed schema
const requestNeedSchema = new Schema({
    id: { 
        type: Number, 
        unique: true, 
        required: true 
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    location: { type: String, required: true },
    expirationDate: {
        type: Date,
        required: true,
        validate: {
            validator: (date) => date > new Date(), // Ensure future date
            message: 'Expiration date must be in the future'
        }
    },
    description: { type: String, maxlength: 500 },
    category: { type: String, enum: Object.values(Category), required: true }, // Lowercase naming

    recipient: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    requestedProducts: [productRequestSchema],
    status: { 
        type: String, 
        enum: Object.values(RequestStatus), 
        default: RequestStatus.PENDING, 
        required: true 
    },
    linkedDonation: { 
        type: Schema.Types.ObjectId, 
        ref: 'Donation', 
        required: false // Optional field
    },
    NumberOfMeals: { 
        type: Number, 
        required: false, 
        min: [1, 'Quantity must be at least 1'],
        validate: {
            validator: Number.isInteger,
            message: 'Quantity must be an integer'
        }
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Pre-save hook to auto-increment the ID
requestNeedSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'RequestNeedId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.id = counter.seq;
        } catch (err) {
            return next(new Error('Failed to generate request ID: ' + err.message));
        }
    }
    next();
});

// Create and export the model
const RequestNeed = mongoose.model('RequestNeed', requestNeedSchema);
module.exports = RequestNeed;