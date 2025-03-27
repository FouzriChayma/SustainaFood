const DonationTransaction = require('../models/DonationTransaction');
const RequestNeed = require('../models/RequestNeed');
const Donation = require('../models/Donation');
const Product = require('../models/Product');
const Counter = require('../models/Counter');
const nodemailer = require("nodemailer");
const path = require("path");
const User = require('../models/User');  // Add this line
// ✅ Get all donation transactions
// Function to send email notifications
async function sendEmail(to, subject, text, html, attachments = []) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false, // Disable SSL verification (use with caution)
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
            attachments,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}
async function getAllDonationTransactions(req, res) {
    try {
        const transactions = await DonationTransaction.find()
            .populate('requestNeed')
            .populate('donation')
            .populate('allocatedProducts.product');
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Get donation transaction by ID
async function getDonationTransactionById(req, res) {
    try {
        const { id } = req.params;
        const transaction = await DonationTransaction.findById(id)
            .populate('requestNeed')
            .populate('donation')
            .populate('allocatedProducts.product');

        if (!transaction) {
            return res.status(404).json({ message: 'Donation transaction not found' });
        }

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Get donation transactions by RequestNeed ID
async function getDonationTransactionsByRequestNeedId(req, res) {
    try {
        const { requestNeedId } = req.params;
        const transactions = await DonationTransaction.find({ requestNeed: requestNeedId })
            .populate('donation')
            .populate('allocatedProducts.product');

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found for this request need' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Get donation transactions by Donation ID
async function getDonationTransactionsByDonationId(req, res) {
    try {
        const { donationId } = req.params;
        const transactions = await DonationTransaction.find({ donation: donationId })
            .populate('requestNeed')
            .populate('allocatedProducts.product');

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found for this donation' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Get donation transactions by Status
async function getDonationTransactionsByStatus(req, res) {
    try {
        const { status } = req.params;
        const transactions = await DonationTransaction.find({ status })
            .populate('requestNeed')
            .populate('donation')
            .populate('allocatedProducts.product');

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found with this status' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Create a new donation transaction
async function createDonationTransaction(req, res) {
    try {
        const { requestNeed, donation, allocatedProducts, status } = req.body;

        // Validate required fields
        if (!requestNeed || !donation || !allocatedProducts || !status) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate allocatedProducts
        if (!Array.isArray(allocatedProducts) || !allocatedProducts.length) {
            return res.status(400).json({ message: 'At least one allocated product is required' });
        }

        // Create the donation transaction
        const newTransaction = new DonationTransaction({
            requestNeed,
            donation,
            allocatedProducts,
            status
        });

        await newTransaction.save();
        res.status(201).json({ message: 'Donation transaction created successfully', newTransaction });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create donation transaction', error });
    }
}

// ✅ Update a donation transaction by ID
async function updateDonationTransaction(req, res) {
    try {
        const { id } = req.params;
        const { requestNeed, donation, allocatedProducts, status } = req.body;

        const updatedTransaction = await DonationTransaction.findByIdAndUpdate(
            id,
            { requestNeed, donation, allocatedProducts, status },
            { new: true }
        )
            .populate('requestNeed')
            .populate('donation')
            .populate('allocatedProducts.product');

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Donation transaction not found' });
        }

        res.status(200).json({ message: 'Donation transaction updated successfully', updatedTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update donation transaction', error });
    }
}

// ✅ Delete a donation transaction by ID
async function deleteDonationTransaction(req, res) {
    try {
        const { id } = req.params;
        const deletedTransaction = await DonationTransaction.findByIdAndDelete(id);

        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Donation transaction not found' });
        }

        res.status(200).json({ message: 'Donation transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete donation transaction', error });
    }
}
// ✅ Get transactions by recipient ID
async function getTransactionsByRecipientId(req, res) {
    try {
        const { recipientId } = req.params;
        const transactions = await DonationTransaction.find({ recipient: recipientId })
            .populate('requestNeed')
            .populate('donation')
            .populate('allocatedProducts.product')
            .populate('donor');

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found for this recipient' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Accept a donation transaction
async function acceptDonationTransaction(req, res) {
    try {
        const { transactionId } = req.params;
        const transaction = await DonationTransaction.findById(transactionId)
            .populate('requestNeed')
            .populate('donation')
            .populate('allocatedProducts.product');

        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        if (transaction.status !== 'pending') return res.status(400).json({ message: `Transaction cannot be accepted in its current state (${transaction.status})` });

        const donation = transaction.donation;
        for (const allocatedProduct of transaction.allocatedProducts) {
            const donationProduct = donation.products.find(p => p.product.toString() === allocatedProduct.product._id.toString());
            if (donationProduct) {
                donationProduct.quantity -= allocatedProduct.quantity;
                if (donationProduct.quantity < 0) donationProduct.quantity = 0;
            }
        }
        await donation.save();

        transaction.status = 'approved';
        transaction.responseDate = new Date();
        await transaction.save();

        await checkRequestFulfillment(transaction.requestNeed._id);

        res.status(200).json({ message: 'Donation accepted successfully', transaction });
    } catch (error) {
        res.status(500).json({ message: 'Failed to accept donation', error: error.message });
    }
}

// ✅ Reject a donation transaction
// ✅ Reject a donation transaction
async function rejectDonationTransaction(req, res) {
    try {
        const { transactionId } = req.params;
        const { rejectionReason } = req.body;

        // Find the transaction
        const transaction = await DonationTransaction.findById(transactionId).populate('donation');
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check if the transaction is in a state that can be rejected
        if (transaction.status !== 'pending') {
            return res.status(400).json({ 
                message: `Transaction cannot be rejected in its current state (${transaction.status})`
            });
        }

        // Update the transaction status
        transaction.status = 'rejected';
        transaction.responseDate = new Date();
        transaction.rejectionReason = rejectionReason || 'No reason provided';
        await transaction.save();

        // Update the associated Donation status
        const donation = transaction.donation;
        if (donation) {
            donation.status = 'rejected';
            await donation.save();
        }

        res.status(200).json({ 
            message: 'Donation rejected successfully', 
            transaction 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to reject donation', 
            error: error.message 
        });
    }
}
// controllers/donationTransactionController.js
// controllers/donationTransactionController.js
async function createAndAcceptDonationTransaction(req, res) {
    try {
        const { donationId, requestNeedId } = req.body;
        const user = req.user;

        console.log('Creating transaction with:', { donationId, requestNeedId, userId: user?._id });

        // Validate input
        if (!donationId || !requestNeedId) {
            return res.status(400).json({ message: 'donationId and requestNeedId are required' });
        }

        // Fetch donation and populate products
        const donation = await Donation.findById(donationId).populate('products.product');
        if (!donation) return res.status(404).json({ message: 'Donation not found' });
        console.log('Donation fetched:', JSON.stringify(donation, null, 2));

        // Fetch the donor to get their email and name
        const donor = await User.findById(donation.donor);
        if (!donor) return res.status(404).json({ message: 'Donor not found' });

        // Fetch request need
        const requestNeed = await RequestNeed.findById(requestNeedId);
        if (!requestNeed) return res.status(404).json({ message: 'RequestNeed not found' });
        console.log('RequestNeed fetched:', JSON.stringify(requestNeed, null, 2));

        const recipientId = requestNeed.recipient || user._id;

        // Validate donation status
        if (donation.status !== 'pending') {
            return res.status(400).json({ message: `Donation cannot be used in its current state (${donation.status})` });
        }

        // Fetch products linked to the request
        const requestProducts = await Product.find({ _id: { $in: requestNeed.requestedProducts } });
        if (!requestProducts.length) {
            return res.status(400).json({ message: 'No products found for this request' });
        }
        console.log('Request products fetched:', JSON.stringify(requestProducts, null, 2));

        // Map donation and request products
        const donationMap = new Map(donation.products.map(p => [p.product._id.toString(), p.quantity]));
        console.log('Donation products map:', [...donationMap]);

        const requestMap = new Map(requestProducts.map(p => [p._id.toString(), p.totalQuantity]));
        console.log('Request products map:', [...requestMap]);

        // Calculate allocated products and update quantities
        const allocatedProducts = [];
        const updatedProducts = [];
        for (const [productId, totalQuantity] of requestMap) {
            const availableQty = donationMap.get(productId) || 0;
            if (availableQty > 0 && totalQuantity > 0) {
                const allocatedQty = Math.min(availableQty, totalQuantity);
                allocatedProducts.push({
                    product: productId,
                    quantity: allocatedQty
                });

                // Update Product totalQuantity
                const product = requestProducts.find(p => p._id.toString() === productId);
                product.totalQuantity -= allocatedQty;
                if (product.totalQuantity < 0) product.totalQuantity = 0;
                updatedProducts.push(product);
                console.log(`Updated product ${productId} totalQuantity: ${product.totalQuantity}`);
            }
        }

        if (!allocatedProducts.length) {
            return res.status(400).json({ message: 'No matching products available to allocate' });
        }
        console.log('Allocated products:', allocatedProducts);

        // Save updated donation
        donation.status = 'approved';
        await donation.save();
        console.log('Donation saved successfully');

        // Save updated products
        for (const product of updatedProducts) {
            await product.save();
            console.log(`Product ${product._id} saved with totalQuantity: ${product.totalQuantity}`);
        }

        // Update request status
        const isFullyFulfilled = requestProducts.every(p => p.totalQuantity === 0);
        requestNeed.status = isFullyFulfilled ? 'fulfilled' : 'partially_fulfilled';
        await requestNeed.save();
        console.log('RequestNeed saved successfully with status:', requestNeed.status);

        // Create transaction
        const counter = await Counter.findOneAndUpdate(
            { _id: 'DonationTransactionId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        if (!counter) throw new Error('Failed to increment DonationTransactionId counter');
        const transactionId = counter.seq;

        const transaction = new DonationTransaction({
            id: transactionId,
            donation: donationId,
            requestNeed: requestNeedId,
            donor: donation.donor,
            recipient: recipientId,
            allocatedProducts,
            status: 'approved',
            responseDate: new Date()
        });

        await transaction.save();
        console.log('Transaction saved successfully:', transaction);

        // Send email notification to the donor
        if (donor.email) {
            const subject = `Your Donation "${donation.title}" Has Been Accepted`;
            const text = `Dear ${donor.name || 'Donor'},

Your donation titled "${donation.title}" has been accepted.

Donation Details:
- Title: ${donation.title}
- Request: ${requestNeed.title}
- Allocated Products: ${allocatedProducts.map(ap => {
                const product = requestProducts.find(p => p._id.toString() === ap.product.toString());
                return `${product?.name || 'Unknown Product'} (Quantity: ${ap.quantity})`;
            }).join(', ')}
- Accepted On: ${new Date().toLocaleDateString()}

Thank you for your generosity!

Best regards,
Your Platform Team`;

            const html = `
                <div style="font-family: Arial, sans-serif; color: black;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="cid:logo" alt="Platform Logo" style="max-width: 150px; height: auto;" />
                    </div>
                    <h2 style="color: #228b22;">Your Donation Has Been Accepted</h2>
                    <p>Dear ${donor.name || 'Donor'},</p>
                    <p>Your donation titled "<strong>${donation.title}</strong>" has been accepted.</p>
                    <h3>Donation Details:</h3>
                    <ul>
                        <li><strong>Title:</strong> ${donation.title}</li>
                        <li><strong>Request:</strong> ${requestNeed.title}</li>
                        <li><strong>Allocated Products:</strong> ${allocatedProducts.map(ap => {
                            const product = requestProducts.find(p => p._id.toString() === ap.product.toString());
                            return `${product?.name || 'Unknown Product'} (Quantity: ${ap.quantity})`;
                        }).join(', ')}</li>
                        <li><strong>Accepted On:</strong> ${new Date().toLocaleDateString()}</li>
                    </ul>
                    <p>Thank you for your generosity!</p>
                    <p style="margin-top: 20px;">Best regards,<br>Your Platform Team</p>
                </div>
            `;

            const attachments = [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, '../uploads/logo.png'), // Adjust path to your logo file
                    cid: 'logo',
                },
            ];

            await sendEmail(donor.email, subject, text, html, attachments);
        } else {
            console.warn(`Donor email not found for donor ID: ${donation.donor}`);
        }

        res.status(201).json({ 
            message: 'Transaction created and accepted successfully', 
            transaction,
            updatedRequest: requestNeed 
        });
    } catch (error) {
        console.error('Error creating and accepting transaction:', error.stack);
        res.status(500).json({ message: 'Failed to create and accept transaction', error: error.message });
    }
}
  
  async function checkRequestFulfillment(requestId) {
    const request = await RequestNeed.findById(requestId).populate('requestedProducts');
    const transactions = await DonationTransaction.find({ 
      requestNeed: requestId, 
      status: 'approved' 
    }).populate('allocatedProducts.product');
  
    const requestedMap = new Map(request.requestedProducts.map(p => [p._id.toString(), p.totalQuantity]));
    const allocatedMap = new Map();
  
    transactions.forEach(t => {
      t.allocatedProducts.forEach(ap => {
        const productId = ap.product._id.toString();
        allocatedMap.set(productId, (allocatedMap.get(productId) || 0) + ap.quantity);
      });
    });
  
    const allFulfilled = [...requestedMap].every(([productId, requestedQty]) => 
      (allocatedMap.get(productId) || 0) >= requestedQty
    );
  
    if (allFulfilled) {
      request.status = 'fulfilled';
      await request.save();
    }
  }

// ✅ Reject a donation directly (without a transaction)
async function rejectDonation(req, res) {
    try {
        const { donationId } = req.params;
        const { rejectionReason } = req.body;

        // Find the donation
        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Fetch the donor to get their email and name
        const donor = await User.findById(donation.donor);
        if (!donor) return res.status(404).json({ message: 'Donor not found' });

        // Check if the donation is in a state that can be rejected
        if (donation.status !== 'pending') {
            return res.status(400).json({ 
                message: `Donation cannot be rejected in its current state (${donation.status})`
            });
        }

        // Update the donation status
        donation.status = 'rejected';
        donation.rejectionReason = rejectionReason || 'No reason provided';
        await donation.save();

        // Send email notification to the donor
        if (donor.email) {
            const subject = `Your Donation "${donation.title}" Has Been Rejected`;
            const text = `Dear ${donor.name || 'Donor'},

We regret to inform you that your donation titled "${donation.title}" has been rejected.

Donation Details:
- Title: ${donation.title}
- Rejection Reason: ${rejectionReason || 'No reason provided'}
- Rejected On: ${new Date().toLocaleDateString()}

If you have any questions, please contact our support team.

Best regards,
Your Platform Team`;

            const html = `
                <div style="font-family: Arial, sans-serif; color: black;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="cid:logo" alt="Platform Logo" style="max-width: 150px; height: auto;" />
                    </div>
                    <h2 style="color: #dc3545;">Your Donation Has Been Rejected</h2>
                    <p>Dear ${donor.name || 'Donor'},</p>
                    <p>We regret to inform you that your donation titled "<strong>${donation.title}</strong>" has been rejected.</p>
                    <h3>Donation Details:</h3>
                    <ul>
                        <li><strong>Title:</strong> ${donation.title}</li>
                        <li><strong>Rejection Reason:</strong> ${rejectionReason || 'No reason provided'}</li>
                        <li><strong>Rejected On:</strong> ${new Date().toLocaleDateString()}</li>
                    </ul>
                    <p>If you have any questions, please contact our support team.</p>
                    <p style="margin-top: 20px;">Best regards,<br>Your Platform Team</p>
                </div>
            `;

            const attachments = [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, '../uploads/logo.png'), // Adjust path to your logo file
                    cid: 'logo',
                },
            ];

            await sendEmail(donor.email, subject, text, html, attachments);
        } else {
            console.warn(`Donor email not found for donor ID: ${donation.donor}`);
        }

        res.status(200).json({ 
            message: 'Donation rejected successfully', 
            donation 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to reject donation', 
            error: error.message 
        });
    }
}
module.exports = {
    getAllDonationTransactions,
    getDonationTransactionById,
    getDonationTransactionsByRequestNeedId,
    getDonationTransactionsByDonationId,
    getDonationTransactionsByStatus,
    createDonationTransaction,
    updateDonationTransaction,
    deleteDonationTransaction,
    getTransactionsByRecipientId,
    acceptDonationTransaction,
    rejectDonationTransaction,
    createAndAcceptDonationTransaction,
    rejectDonation,
};