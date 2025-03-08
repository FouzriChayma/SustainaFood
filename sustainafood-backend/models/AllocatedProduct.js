const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter'); // Assumes a Counter model for auto-incrementing IDs

// Define the AllocatedProduct schema
const allocatedProductSchema = new Schema({
    id: { 
        type: Number, 
        unique: true, 
        required: true 
    },
    donationTransaction: { 
        type: Schema.Types.ObjectId, 
        ref: 'DonationTransaction', 
        required: true 
    },
    product: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    allocatedQuantity: { 
        type: Number, 
        required: true, 
        min: [1, 'Allocated quantity must be at least 1'],
        validate: {
            validator: Number.isInteger,
            message: 'Allocated quantity must be an integer'
        }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save hook to auto-increment the ID
allocatedProductSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'AllocatedProductId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.id = counter.seq;
        } catch (err) {
            return next(new Error('Failed to generate allocated product ID: ' + err.message));
        }
    }
    next();
});

// Add indexes for performance
allocatedProductSchema.index({ donationTransaction: 1 });
allocatedProductSchema.index({ product: 1 });

// Create and export the model
const AllocatedProduct = mongoose.model('AllocatedProduct', allocatedProductSchema);
module.exports = AllocatedProduct;