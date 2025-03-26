const RequestNeed = require('../models/RequestNeed');
const Product = require('../models/Product');
const Counter = require('../models/Counter');
const Donation = require('../models/Donation'); // Added import for Donation
const DonationTransaction = require('../models/DonationTransaction');
const nodemailer = require("nodemailer");
const path = require("path");
const mongoose = require('mongoose');
const User = require('../models/User');




// ✅ Create a RequestNeed for an existing Donation
async function createRequestNeedForExistingDonation(req, res) {
    try {
        const { donationId } = req.params;
        const { recipientId, requestedProducts, description } = req.body;

        // Validate input
        if (!donationId || !mongoose.Types.ObjectId.isValid(donationId)) {
            return res.status(400).json({ message: 'Invalid donation ID' });
        }
        if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
            return res.status(400).json({ message: 'Invalid recipient ID' });
        }
        if (!requestedProducts || !Array.isArray(requestedProducts)) {
            return res.status(400).json({ message: 'requestedProducts must be an array' });
        }

        // Fetch the donation and populate its products
        const donation = await Donation.findById(donationId)
            .populate('products.product')
            .populate('donor');
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Validate donation state
        if (donation.status !== 'pending') {
            return res.status(400).json({ message: 'Donation is not available for requests (status must be pending)' });
        }
        if (new Date(donation.expirationDate) <= new Date()) {
            return res.status(400).json({ message: 'Donation has expired' });
        }

        // Fetch the recipient to validate their role
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }
        if (!['ong', 'student'].includes(recipient.role)) {
            return res.status(403).json({ message: 'Only users with role "ong" or "student" can create requests' });
        }

        // Validate requestedProducts against the donation's products
        const donationProductMap = new Map(
            donation.products.map(p => [p.product._id.toString(), { quantity: p.quantity, product: p.product }])
        );
        const validatedProducts = [];
        let totalMeals = 0;

        for (const { product: productId, quantity } of requestedProducts) {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: `Invalid product ID: ${productId}` });
            }
            if (!donationProductMap.has(productId)) {
                return res.status(400).json({ message: `Product ${productId} is not part of this donation` });
            }

            const availableQuantity = donationProductMap.get(productId).quantity;
            if (!Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({ message: `Quantity for product ${productId} must be a positive integer` });
            }
            if (quantity > availableQuantity) {
                return res.status(400).json({ message: `Requested quantity (${quantity}) for product ${productId} exceeds available quantity (${availableQuantity})` });
            }

            validatedProducts.push(productId);
            totalMeals += quantity;
        }

        // Create the new RequestNeed
        const newRequest = new RequestNeed({
            title: `Request for ${donation.title}`,
            location: donation.location,
            expirationDate: donation.expirationDate,
            description: description || '',
            category: donation.category,
            recipient: recipientId,
            requestedProducts: validatedProducts,
            status: 'pending',
            linkedDonation: [donationId],
            isaPost:false,
            numberOfMeals: donation.category === 'prepared_meals' ? totalMeals : undefined,
        });

        await newRequest.save();

        // Update the Donation to link the new request
        await Donation.findByIdAndUpdate(
            donationId,
            { $push: { linkedRequests: newRequest._id } },
            { new: true }
        );

        // Fetch the populated request for the response
        const populatedRequest = await RequestNeed.findById(newRequest._id)
            .populate('recipient')
            .populate('requestedProducts');

        // Send notification to donor
        if (donation.donor && donation.donor.email) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: donation.donor.email,
                subject: `New Request for Your Donation: ${donation.title}`,
                text: `Dear ${donation.donor.name || 'Donor'},

A new request has been made for your donation titled "${donation.title}".

Request Details:
- Title: ${newRequest.title}
- Recipient: ${recipient.name || 'Unknown Recipient'}
- Requested Products: ${requestedProducts.map(rp => {
                    const product = donationProductMap.get(rp.product).product;
                    return `${product.name} (Quantity: ${rp.quantity})`;
                }).join(', ')}
- Expiration Date: ${newRequest.expirationDate.toLocaleDateString()}

You can review the request in your dashboard.

Best regards,
Your Platform Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: black;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <img src="cid:logo" alt="Platform Logo" style="max-width: 150px; height: auto;" />
                        </div>
                        <h2 style="color: #228b22;">New Request for Your Donation</h2>
                        <p>Dear ${donation.donor.name || 'Donor'},</p>
                        <p>A new request has been made for your donation titled "<strong>${donation.title}</strong>".</p>
                        <h3>Request Details:</h3>
                        <ul>
                            <li><strong>Title:</strong> ${newRequest.title}</li>
                            <li><strong>Recipient:</strong> ${recipient.name || 'Unknown Recipient'}</li>
                            <li><strong>Requested Products:</strong> ${requestedProducts.map(rp => {
                                const product = donationProductMap.get(rp.product).product;
                                return `${product.name} (Quantity: ${rp.quantity})`;
                            }).join(', ')}</li>
                            <li><strong>Expiration Date:</strong> ${newRequest.expirationDate.toLocaleDateString()}</li>
                        </ul>
                        <p>You can review the request in your dashboard.</p>
                        <p style="margin-top: 20px;">Best regards,<br>Your Platform Team</p>
                    </div>
                `,
                attachments: [
                    {
                        filename: 'logo.png',
                        path: path.join(__dirname, '../uploads/logo.png'),
                        cid: 'logo',
                    },
                ],
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${donation.donor.email}`);
        }

        res.status(201).json({
            message: 'Request created successfully for the donation',
            request: populatedRequest,
        });
    } catch (error) {
        console.error('Create Request Error:', error);
        res.status(500).json({
            message: 'Failed to create request for the donation',
            error: error.message,
        });
    }
}




async function getAllRequests(req, res) {
    try {
        const requests = await RequestNeed.find({ isaPost: true })
            .populate('recipient')
            .populate('requestedProducts');
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Get request by ID
async function getRequestById(req, res) {
    try {
        const { id } = req.params;
        const request = await RequestNeed.findById(id)
            .populate('recipient')
            .populate('requestedProducts');

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
        const requests = await RequestNeed.find({ recipient: recipientId })
            .populate('requestedProducts');

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
        const requests = await RequestNeed.find({ status })
            .populate('recipient')
            .populate('requestedProducts');

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

        // Ensure requestedProducts is an array and handle parsing if it's a string
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

        // Validate and assign numberOfMeals for prepared meals
        if (category === 'prepared_meals') {
            const parsedNumberOfMeals = parseInt(numberOfMeals, 10);
            if (isNaN(parsedNumberOfMeals) || parsedNumberOfMeals <= 0) {
                return res.status(400).json({ message: '❌ numberOfMeals must be a valid positive integer for prepared meals' });
            }
            newRequest.numberOfMeals = parsedNumberOfMeals;
        }

        await newRequest.save(); // Save to obtain the request _id
        const requestId = newRequest._id;

        // Assign request ID and auto-incremented product ID for each product
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

        // Insert products if there are any valid ones
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
        const {  requestedProducts, ...donationData } = req.body;

        const updatedRequest = await RequestNeed.findByIdAndUpdate(
            id,
            {  requestedProducts, ...donationData},
            { new: true }
        )
        .populate('recipient')
        .populate('requestedProducts');

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

async function addDonationToRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { products, donor, expirationDate } = req.body;
  
      // Fetch the request and populate requestedProducts and recipient
      const request = await RequestNeed.findById(requestId)
        .populate('requestedProducts')
        .populate('recipient'); // Assuming 'recipient' is a field in RequestNeed referencing the User model
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      console.log('Request category:', request.category);
      console.log('Request numberOfMeals:', request.numberOfMeals);
      console.log('Request linkedDonation:', request.linkedDonation);
  
      // Validate products against the request
      const productMap = new Map(request.requestedProducts.map(p => [p._id.toString(), p.totalQuantity]));
      const donationProducts = products.map(({ product, quantity }) => {
        if (!productMap.has(product)) {
          throw new Error(`Product ${product} not found in request`);
        }
        const maxQty = productMap.get(product);
        return {
          product,
          quantity: Math.min(quantity, maxQty),
        };
      });
  
      // Create the new donation
      const newDonation = new Donation({
        title: request.title,
        donor: donor || req.user.id,
        description: `Donation for request ${request.title}`,
        category: request.category,
        location: request.location,
        products: donationProducts,
        numberOfMeals: request.category === 'prepared_meals' ? (request.numberOfMeals || 1) : undefined,
        expirationDate: expirationDate || request.expirationDate,
        isaPost:false,
        linkedRequests: [requestId],
      });
  
      const savedDonation = await newDonation.save();
  
      // Update the request's linkedDonation field
      if (request.linkedDonation === null || request.linkedDonation === undefined) {
        await RequestNeed.updateOne({ _id: requestId }, { $set: { linkedDonation: [] } });
      }
  
      await RequestNeed.updateOne({ _id: requestId }, { $push: { linkedDonation: savedDonation._id } });
  
      // Fetch the recipient's email and send notification
      const recipient = request.recipient; // Assuming recipient is populated
      if (!recipient || !recipient.email) {
        console.warn('Recipient email not found for request:', requestId);
      } else {
        // Populate the donor and products in the saved donation to get names
        const populatedDonation = await Donation.findById(savedDonation._id)
          .populate('donor') // Populate donor to get the name
          .populate('products.product'); // Populate products to get product names
  
        // Configure email transporter
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false, // Disable SSL verification
          },
        });
  
        // Email details
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipient.email,
          subject: `New Donation Added to Your Request: ${request.title}`,
          text: `Dear ${recipient.name || 'Recipient'},
  
  A new donation has been added to your request titled "${request.title}".
  
  Donation Details:
  - Title: ${populatedDonation.title}
  - Donor: ${populatedDonation.donor?.name || 'Unknown Donor'}
  - Products: ${populatedDonation.products
            .map(p => `${p.product?.name || 'Unknown Product'} (Quantity: ${p.quantity})`)
            .join(', ')}
  - Expiration Date: ${populatedDonation.expirationDate ? new Date(populatedDonation.expirationDate).toLocaleDateString() : 'Not set'}
  
  Thank you for using our platform!
  
  Best regards,
  Your Platform Team`,
          html: `
            <div style="font-family: Arial, sans-serif; color: black;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="cid:logo" alt="Platform Logo" style="max-width: 150px; height: auto;" />
              </div>
              <h2 style="color: #228b22;">New Donation Added to Your Request</h2>
              <p>Dear ${recipient.name || 'Recipient'},</p>
              <p>A new donation has been added to your request titled "<strong>${request.title}</strong>".</p>
              <h3>Donation Details:</h3>
              <ul>
                <li><strong>Title:</strong> ${populatedDonation.title}</li>
                <li><strong>Donor:</strong> ${populatedDonation.donor?.name || 'Unknown Donor'}</li>
                <li><strong>Products:</strong> ${populatedDonation.products
                  .map(p => `${p.product?.name || 'Unknown Product'} (Quantity: ${p.quantity})`)
                  .join(', ')}</li>
                <li><strong>Expiration Date:</strong> ${populatedDonation.expirationDate ? new Date(populatedDonation.expirationDate).toLocaleDateString() : 'Not set'}</li>
              </ul>
              <p>Thank you for using our platform!</p>
              <p style="margin-top: 20px;">Best regards,<br>Your Platform Team</p>
            </div>
          `,
          attachments: [
            {
              filename: 'logo.png',
              path: path.join(__dirname, '../uploads/logo.png'), // Adjust path to match your logo file
              cid: 'logo', // Content-ID to reference in the HTML
            },
          ],
        };
  
        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipient.email}`);
      }
  
      res.status(201).json({
        message: 'Donation added to request successfully',
        donation: savedDonation,
      });
    } catch (error) {
      console.error('Donation Error:', error);
      res.status(500).json({ message: 'Failed to add donation to request', error: error.message });
    }
  }

  async function getRequestWithDonations(req, res) {
    try {
        const { requestId } = req.params;
        
        // Get the request with its donations and transactions
        const request = await RequestNeed.findById(requestId)
            .populate('recipient')
            .populate('requestedProducts')
            .populate('linkedDonation');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Get all transactions related to this request
        const transactions = await DonationTransaction.find({ requestNeed: requestId })
            .populate('donation')
            .populate('allocatedProducts.product')
            .populate('donor');

        res.status(200).json({
            request,
            transactions
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
}
  
module.exports = {
    addDonationToRequest,
    getAllRequests,
    getRequestById,
    getRequestsByRecipientId,
    getRequestsByStatus,
    createRequest,
    updateRequest,
    deleteRequest,
    createRequestNeedForExistingDonation,
    getRequestWithDonations,
};
