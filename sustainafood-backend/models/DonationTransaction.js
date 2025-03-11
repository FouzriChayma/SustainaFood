const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter'); // Assumes a Counter model for auto-incrementing IDs

// Define the status enum
const TransactionStatus = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};
Object.freeze(TransactionStatus); // Prevents changes to the enum

// Define the AllocatedProduct subdocument schema (embedded in DonationTransaction)
const allocatedProductSchema = new Schema({
    product: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
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

// Define the DonationTransaction schema
const donationTransactionSchema = new Schema({
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
    donation: { 
        type: Schema.Types.ObjectId, 
        ref: 'Donation', 
        required: true 
    },
    allocatedProducts: [allocatedProductSchema],
    status: { 
        type: String, 
        enum: Object.values(TransactionStatus), 
        default: TransactionStatus.PENDING, 
        required: true 
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Pre-save hook to auto-increment the ID
donationTransactionSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'DonationTransactionId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.id = counter.seq;
        } catch (err) {
            return next(new Error('Failed to generate transaction ID: ' + err.message));
        }
    }
    next();
});

// Add indexes for better query performance
donationTransactionSchema.index({ requestNeed: 1 });
donationTransactionSchema.index({ donation: 1 });
donationTransactionSchema.index({ status: 1 });

// Create and export the model
const DonationTransaction = mongoose.model('DonationTransaction', donationTransactionSchema);
module.exports = DonationTransaction;