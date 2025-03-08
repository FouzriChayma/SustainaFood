const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter'); // Assumes a Counter model for auto-incrementing IDs

// Define the ProductRequest schema
const productRequestSchema = new Schema({
    id: { 
        type: Number, 
        unique: true, 
        required: true 
    },
    requestNeed: { 
        type: Schema.Types.ObjectId, 
        ref: 'RequestNeed', 
        required: true 
    },
    productName: { 
        type: String, 
        required: true, 
        minlength: 2, 
        maxlength: 100 
    },
    requestedQuantity: { 
        type: Number, 
        required: true, 
        min: [1, 'Requested quantity must be at least 1'],
        validate: {
            validator: Number.isInteger,
            message: 'Requested quantity must be an integer'
        }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save hook to auto-increment the ID
productRequestSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'ProductRequestId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.id = counter.seq;
        } catch (err) {
            return next(new Error('Failed to generate product request ID: ' + err.message));
        }
    }
    next();
});

// Create and export the model
const ProductRequest = mongoose.model('ProductRequest', productRequestSchema);
module.exports = ProductRequest;