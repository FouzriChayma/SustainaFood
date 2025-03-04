const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter');

const status = {
    AVAILABLE: 'available',
    PENDING: 'pending'
};

const productSchema = new Schema({
    productType: { type: String, required: true },
    weightPerUnit: { type: String, required: true }, // Changed to Number
    productDescription: { type: String, required: true },
    totalQuantity: { type: String, required: true }, // Changed to Number
    id: { type: Number, unique: true, required: true }, // Auto-incremented custom ID
    iddonation: { type: Schema.Types.ObjectId, ref: 'Donation', required: true },
    status: { type: String, enum: Object.values(status), default: status.AVAILABLE } // Using the ENUM constant
}, { timestamps: true }); // Auto-creates createdAt & updatedAt fields

// Pre-save hook to auto-increment `id` before saving a new product
productSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'ProductId' },
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

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
