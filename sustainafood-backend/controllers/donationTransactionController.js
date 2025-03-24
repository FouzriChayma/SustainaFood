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
// controllers/donationTransactionController.js
// controllers/donationTransactionController.js
async function createAndAcceptDonationTransaction(req, res) {
    try {
        const { donationId, requestNeedId } = req.body;
        const user = req.user;

        console.log('Creating transaction with:', { donationId, requestNeedId, userId: user?._id });

        const donation = await Donation.findById(donationId);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        const requestNeed = await RequestNeed.findById(requestNeedId);
        if (!requestNeed) return res.status(404).json({ message: 'RequestNeed not found' });

        const recipientId = requestNeed.recipient || user._id;

        // Manually fetch and increment the counter
        const counter = await Counter.findOneAndUpdate(
            { _id: 'DonationTransactionId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const transactionId = counter.seq;

        const transaction = new DonationTransaction({
            id: transactionId, // Explicitly set id
            donation: donationId,
            requestNeed: requestNeedId,
            donor: donation.donor,
            recipient: recipientId,
            allocatedProducts: donation.products.map(p => ({
                product: p.product,
                quantity: p.quantity
            })),
            status: 'approved',
            responseDate: new Date()
        });

        console.log('Transaction before save:', transaction.toObject());
        await transaction.save();
        console.log('Transaction saved:', transaction.toObject());

        donation.status = 'approved';
        await donation.save();

        await checkRequestFulfillment(requestNeedId);

        res.status(201).json({ message: 'Transaction created and accepted successfully', transaction });
    } catch (error) {
        console.error('Error creating and accepting transaction:', error);
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
};