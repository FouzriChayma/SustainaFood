const DonationTransaction = require('../models/DonationTransaction');
const RequestNeed = require('../models/RequestNeed');
const Donation = require('../models/Donation');
const Product = require('../models/Product');
const Counter = require('../models/Counter');

// ✅ Get all donation transactions
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
        
        // Find the transaction
        const transaction = await DonationTransaction.findById(transactionId)
            .populate('requestNeed')
            .populate('donation')
            .populate('allocatedProducts.product');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check if the transaction is in a state that can be accepted
        if (transaction.status !== TransactionStatus.PENDING) {
            return res.status(400).json({ 
                message: `Transaction cannot be accepted in its current state (${transaction.status})`
            });
        }

        // Update product quantities in the request
        for (const allocatedProduct of transaction.allocatedProducts) {
            const product = await Product.findById(allocatedProduct.product._id);
            if (!product) continue;

            // Reduce the available quantity
            product.totalQuantity -= allocatedProduct.quantity;
            
            // If quantity reaches zero, mark as out of stock
            if (product.totalQuantity <= 0) {
                product.status = ProductStatus.OUT_OF_STOCK;
                product.totalQuantity = 0;
            }
            
            await product.save();
        }

        // Update the transaction status
        transaction.status = TransactionStatus.APPROVED;
        transaction.responseDate = new Date();
        await transaction.save();

        // Check if the request is now fully fulfilled
        await checkRequestFulfillment(transaction.requestNeed._id);

        res.status(200).json({ 
            message: 'Donation accepted successfully', 
            transaction 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to accept donation', 
            error: error.message 
        });
    }
}

// ✅ Reject a donation transaction
async function rejectDonationTransaction(req, res) {
    try {
        const { transactionId } = req.params;
        const { rejectionReason } = req.body;

        // Find the transaction
        const transaction = await DonationTransaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check if the transaction is in a state that can be rejected
        if (transaction.status !== TransactionStatus.PENDING) {
            return res.status(400).json({ 
                message: `Transaction cannot be rejected in its current state (${transaction.status})`
            });
        }

        // Update the transaction status
        transaction.status = TransactionStatus.REJECTED;
        transaction.responseDate = new Date();
        transaction.rejectionReason = rejectionReason || 'No reason provided';
        await transaction.save();

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

// Helper function to check if a request is fully fulfilled
async function checkRequestFulfillment(requestId) {
    try {
        const request = await RequestNeed.findById(requestId)
            .populate('requestedProducts');

        if (!request) return;

        // Check if all requested products are fulfilled
        const allFulfilled = request.requestedProducts.every(product => 
            product.status === ProductStatus.OUT_OF_STOCK
        );

        if (allFulfilled) {
            request.status = RequestStatus.FULFILLED;
            await request.save();
        }
    } catch (error) {
        console.error('Error checking request fulfillment:', error);
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
    rejectDonationTransaction
};