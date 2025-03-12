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
    try {
        const { recipient, requestedProducts, status, linkedDonation } = req.body;

        // Validate requestedProducts
        if (!requestedProducts || !requestedProducts.length) {
            return res.status(400).json({ message: 'At least one product is required' });
        }

        // Create the request
        const newRequest = new RequestNeed({
            recipient,
            requestedProducts,
            status,
            linkedDonation
        });

        await newRequest.save();
        res.status(201).json({ message: 'Request created successfully', newRequest });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create request', error });
    }
}


async function createRequest(req, res) {
    console.log("Request body received:", req.body);
    
    try {
        let {
            title,
            location,
            expirationDate,
            description,
            category,
            Type,
            recipient,
            requestedProducts,
            status,
            linkedDonation,
            NumberOfMeals
        } = req.body;

        // Ensure requestedProducts is an array
        if (!Array.isArray(requestedProducts)) {
            if (typeof requestedProducts === 'string') {
                try {
                    requestedProducts = JSON.parse(requestedProducts);
                } catch (error) {
                    return res.status(400).json({ message: "Invalid requestedProducts format" });
                }
            } else {
                requestedProducts = [];
            }
        }

        // Filter out incomplete product requests
        requestedProducts = requestedProducts.filter(product =>
            product.product && product.quantity
        );

        // Create the request without products first
        const newRequest = new RequestNeed({
            title,
            location,
            expirationDate: new Date(expirationDate),
            description,
            category: category || undefined,
            recipient,
            requestedProducts: [],
            status: status || "pending",
            linkedDonation: linkedDonation || null,
            NumberOfMeals: NumberOfMeals || undefined
        });

        await newRequest.save();
        const requestId = newRequest._id;

        // Assign the request ID to each requested product
        for (let product of requestedProducts) {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'ProductRequestId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            product.id = counter.seq;
            product.request = requestId;
        }

        // Create the requested products in the database
        const createdProducts = await Product.insertMany(requestedProducts);
        const productIds = createdProducts.map(product => product._id);

        // Update the request with the created product IDs
        newRequest.requestedProducts = productIds;
        await newRequest.save();

        res.status(201).json({ message: 'Request created successfully', newRequest });
    } catch (error) {
        console.error("Request Creation Error:", error);
        res.status(400).json({
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