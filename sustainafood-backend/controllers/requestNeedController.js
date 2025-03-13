const RequestNeed = require('../models/RequestNeed');
const Product = require('../models/Product');
const Counter = require('../models/Counter');


  


// ✅ Get all requests
async function getAllRequests(req, res) {
    try {
        const requests = await RequestNeed.find().populate('recipient').populate('requestedProducts.product');
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Get request by ID
async function getRequestById(req, res) {
    try {
        const { id } = req.params;
        const request = await RequestNeed.findById(id).populate('recipient').populate('requestedProducts.product');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Get requests by Recipient ID
async function getRequestsByRecipientId(req, res) {
    try {
        const { recipientId } = req.params;
        const requests = await RequestNeed.find({ recipient: recipientId }).populate('requestedProducts.product');

        if (!requests.length) {
            return res.status(404).json({ message: 'No requests found for this recipient' });
        }

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Get requests by Status
async function getRequestsByStatus(req, res) {
    try {
        const { status } = req.params;
        const requests = await RequestNeed.find({ status }).populate('recipient').populate('requestedProducts.product');

        if (!requests.length) {
            return res.status(404).json({ message: 'No requests found with this status' });
        }

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });

    }
}

// ✅ Create a new request

async function createRequest(req, res) {
    console.log("Request body received:", req.body);

    try {
        let {
            title,
            location,
            expirationDate,
            description,
            category,
            recipient,
            requestedProducts,
            status,
            linkedDonation,
            numberOfMeals
        } = req.body;

        // Ensure requestedProducts is an array and handle parsing
        if (typeof requestedProducts === 'string') {
            try {
                requestedProducts = JSON.parse(requestedProducts);
                // Trim keys to remove leading/trailing spaces
                requestedProducts = requestedProducts.map(product => {
                    const trimmedProduct = {};
                    for (let key in product) {
                        const trimmedKey = key.trim();
                        trimmedProduct[trimmedKey] = product[key];
                    }
                    return trimmedProduct;
                });
            } catch (error) {
                return res.status(400).json({ message: "Invalid requestedProducts format" });
            }
        } else if (!Array.isArray(requestedProducts)) {
            requestedProducts = [];
        }

        // Filter out incomplete product requests and log invalid ones
        requestedProducts = requestedProducts.filter(product => {
            const isValid = product.name &&
                product.weightPerUnit &&
                product.totalQuantity &&
                product.productDescription &&
                product.status &&
                product.productType &&
                product.weightUnit &&
                product.weightUnitTotale;
            if (!isValid) {
                console.log("Filtered out invalid product:", product);
            }
            return isValid;
        });

        // Validate expirationDate
        if (isNaN(new Date(expirationDate).getTime())) {
            return res.status(400).json({ message: "Invalid expiration date format" });
        }

        // Create the request without products first
        const newRequest = new RequestNeed({
            title,
            location,
            expirationDate: new Date(expirationDate),
            description,
            category: category || undefined,
            recipient,
            requestedProducts: [], // Initially empty
            status: status || "pending",
            linkedDonation: linkedDonation || null,
            numberOfMeals: category === 'prepared_meals' ? parseInt(numberOfMeals, 10) : undefined
        });

        // Validate numberOfMeals if category is 'prepared_meals'
        if (category === 'prepared_meals') {
            const parsedNumberOfMeals = parseInt(numberOfMeals, 10);
            if (isNaN(parsedNumberOfMeals) || parsedNumberOfMeals <= 0) {
                return res.status(400).json({ message: '❌ numberOfMeals must be a valid positive integer for prepared meals' });
            }
            newRequest.numberOfMeals = parsedNumberOfMeals;
        }

        await newRequest.save(); // Save to obtain the request _id
        const requestId = newRequest._id;

        // Assign request ID and auto-incremented product ID
        for (let product of requestedProducts) {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'ProductRequestId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            product.id = counter.seq;
            product.request = requestId;
        }

        console.log("Processed requestedProducts:", requestedProducts);

        // Insert products if there are any
        let productIds = [];
        if (requestedProducts.length > 0) {
            try {
                const createdProducts = await Product.insertMany(requestedProducts);
                productIds = createdProducts.map(product => product._id);
                console.log("Created Products:", createdProducts);
            } catch (error) {
                console.error("❌ Product Insertion Error:", error);
                return res.status(500).json({ message: "Failed to insert products", error: error.message });
            }
        } else {
            console.warn("No valid products to insert.");
        }

        // Update the request with the created product IDs
        newRequest.requestedProducts = productIds;
        await newRequest.save();

        res.status(201).json({ message: 'Request created successfully', newRequest });
    } catch (error) {
        console.error("Request Creation Error:", error);
        res.status(500).json({
            message: "Failed to create request",
            error: error.message || error
        });
    }
}




// ✅ Update a request by ID
async function updateRequest(req, res) {
    try {
        const { id } = req.params;
        const { recipient, requestedProducts, status, linkedDonation } = req.body;

        const updatedRequest = await RequestNeed.findByIdAndUpdate(
            id,
            { recipient, requestedProducts, status, linkedDonation },
            { new: true }
        ).populate('recipient').populate('requestedProducts.product');

        if (!updatedRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.status(200).json({ message: 'Request updated successfully', updatedRequest });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update request', error });
    }
}

// ✅ Delete a request by ID
async function deleteRequest(req, res) {
    try {
        const { id } = req.params;
        const deletedRequest = await RequestNeed.findByIdAndDelete(id);

        if (!deletedRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete request', error });
    }
}

module.exports = {
    getAllRequests,
    getRequestById,
    getRequestsByRecipientId,
    getRequestsByStatus,
    createRequest,
    updateRequest,
    deleteRequest
};