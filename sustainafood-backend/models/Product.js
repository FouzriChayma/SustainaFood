const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter'); // Assumes a Counter model exists for auto-incrementing IDs

// Define enums for productType
const ProductType = {
    CANNED_GOODS: 'Canned Goods',    // For packaged products
    DRY_GOODS: 'Dry Goods',          // For packaged products
    BEVERAGES: 'Beverages',          // For packaged products
    SNACKS: 'Snacks',                // For packaged products
    SOUP: 'Soup',                    // For prepared meals
    MAIN_COURSE: 'Main Course',      // For prepared meals
    DESSERT: 'Dessert', 
    DRINKS: 'Drinks',   
    VEGETABLES: 'Vegetables',
    FRUITS: 'Fruits',
    MEAT: 'Meat',
    FISH: 'Fish',
    FASTFOOD: 'Fastfood',
    OTHER: 'Other'                   // Flexible for both
};
Object.freeze(ProductType); // Prevents changes to the enum

// Define enums for weight units
const WeightUnit = {
    KG: 'kg',
    G: 'g',
    LB: 'lb',
    OZ: 'oz'
};
Object.freeze(WeightUnit);

// Define enums for product status
const ProductStatus = {
    AVAILABLE: 'available',
    PENDING: 'pending',
    RESERVED: 'reserved',
    OUT_OF_STOCK: 'out_of_stock'
};
Object.freeze(ProductStatus);

// Define the Product schema
const productSchema = new Schema({
    id: { 
        type: Number, 
        unique: true, 
        required: true 
    }, // Auto-incremented unique ID
    name: { 
        type: String, 
        required: true, 
        minlength: 2, 
        maxlength: 100 
    }, // Product name, 2-100 characters
    productType: { 
        type: String, 
        enum: Object.values(ProductType), 
        required: true 
    }, // Must be one of the ProductType values
    productDescription: { 
        type: String, 
        required: true, 
        maxlength: 500 
    }, // Description, max 500 characters
    weightPerUnit: { 
        type: Number, 
        required: false, // Optional for prepared meals
        min: [0, 'Weight per unit must be non-negative'] 
    }, // Weight per item, if applicable
    weightUnit: { 
        type: String, 
        enum: Object.values(WeightUnit), 
        required: false // Optional for prepared meals
    }, // Unit of weight, if applicable
    totalQuantity: { 
        type: Number, 
        required: false, // Optional for prepared meals
        min: [0, 'Total quantity must be non-negative'],
        validate: {
            validator: Number.isInteger,
            message: 'Total quantity must be an integer'
        }
    }, // Total number of units, if applicable
    donation: { 
        type: Schema.Types.ObjectId, 
        ref: 'Donation', 
        required: true 
    }, // Reference to a Donation
    status: { 
        type: String, 
        enum: Object.values(ProductStatus), 
        default: ProductStatus.AVAILABLE, 
        required: true 
    } // Product availability status
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Include virtual fields in JSON output
    toObject: { virtuals: true } // Include virtual fields in object output
});

// Add a virtual field to calculate total weight
productSchema.virtual('totalWeight').get(function() {
    if (this.weightPerUnit && this.totalQuantity) {
        return this.weightPerUnit * this.totalQuantity;
    }
    return null; // Returns null if weight or quantity is missing
});

// Attach enums to the model for easy access
productSchema.statics.ProductType = ProductType;
productSchema.statics.WeightUnit = WeightUnit;
productSchema.statics.ProductStatus = ProductStatus;

// Auto-increment the ID before saving a new product
productSchema.pre('save', async function(next) {
    if (this.isNew) { // Only for new documents
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'ProductId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.id = counter.seq; // Set the new ID
        } catch (err) {
            return next(new Error('Failed to generate product ID: ' + err.message));
        }
    }
    next(); // Proceed with saving
});

// Add an index for faster queries on donation
productSchema.index({ donation: 1 });

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);
module.exports = Product;