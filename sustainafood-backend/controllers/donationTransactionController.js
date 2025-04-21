const DonationTransaction = require('../models/DonationTransaction');
const RequestNeed = require('../models/RequestNeed');
const Donation = require('../models/Donation');
const Product = require('../models/Product');
const Meal = require('../models/Meals'); // Add Meals model
const Counter = require('../models/Counter');
const nodemailer = require("nodemailer");
const path = require("path");
const User = require('../models/User');

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
                rejectUnauthorized: false,
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

// ✅ Get all donation transactions
async function getAllDonationTransactions(req, res) {
    try {
        const transactions = await DonationTransaction.find()
            .populate('requestNeed')
            .populate('donation')
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal'); // Populate allocatedMeals
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
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal'); // Populate allocatedMeals

        if (!transaction) {
            return res.status(404).json({ message: 'Donation transaction not found' });
        }

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// ✅ Get donation transactions by RequestNeed ID
// In donationTransactionController.js
async function getDonationTransactionsByRequestNeedId(req, res) {
    try {
        const { requestNeedId } = req.params;
        const transactions = await DonationTransaction.find({ requestNeed: requestNeedId })
            .populate({
                path: 'donation',
                populate: [
                    { path: 'donor' }, // Populate the donor field
                    { path: 'meals.meal', model: 'Meals' }, // Ensure meals are populated
                ],
            })
            .populate('requestNeed')
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal'); // Populate allocatedMeals

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found for this request need' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// ✅ Get donation transactions by Donation ID
async function getDonationTransactionsByDonationId(req, res) {
    try {
        const { donationId } = req.params;
        const transactions = await DonationTransaction.find({ donation: donationId })
            .populate({
                path: 'donation',
                populate: [
                    { path: 'donor' },
                    { path: 'meals.meal', model: 'Meals' },
                    { path: 'products.product', model: 'Product' },
                ],
            })
            .populate({
                path: 'requestNeed',
                populate: [
                    { path: 'recipient' },
                    { path: 'requestedProducts.product', model: 'Product' },
                    { path: 'requestedMeals.meal', model: 'Meals' },
                ],
            })
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal');

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found for this donation' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// ✅ Get donation transactions by Status
async function getDonationTransactionsByStatus(req, res) {
    try {
        const { status } = req.params;
        const transactions = await DonationTransaction.find({ status })
            .populate('requestNeed')
            .populate('donation')
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal'); // Populate allocatedMeals

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
        const { requestNeed, donation, allocatedProducts, allocatedMeals, status } = req.body;

        // Validate required fields
        if (!requestNeed || !donation || (!allocatedProducts && !allocatedMeals) || !status) {
            return res.status(400).json({ message: 'RequestNeed, donation, at least one of allocatedProducts or allocatedMeals, and status are required' });
        }

        // Validate allocatedProducts if provided
        if (allocatedProducts && (!Array.isArray(allocatedProducts) || !allocatedProducts.length)) {
            return res.status(400).json({ message: 'allocatedProducts must be a non-empty array if provided' });
        }

        // Validate allocatedMeals if provided
        if (allocatedMeals && (!Array.isArray(allocatedMeals) || !allocatedMeals.length)) {
            return res.status(400).json({ message: 'allocatedMeals must be a non-empty array if provided' });
        }

        // Create the donation transaction
        const newTransaction = new DonationTransaction({
            requestNeed,
            donation,
            allocatedProducts: allocatedProducts || [],
            allocatedMeals: allocatedMeals || [],
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
        const { requestNeed, donation, allocatedProducts, allocatedMeals, status } = req.body;

        const updatedTransaction = await DonationTransaction.findByIdAndUpdate(
            id,
            { requestNeed, donation, allocatedProducts, allocatedMeals, status },
            { new: true }
        )
            .populate('requestNeed')
            .populate('donation')
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal'); // Populate allocatedMeals

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


// ✅ Accept a donation transaction
async function acceptDonationTransaction(req, res) {
    try {
        const { transactionId } = req.params;
        const transaction = await DonationTransaction.findById(transactionId)
            .populate('requestNeed')
            .populate('donation')
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal');

        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        if (transaction.status !== 'pending') return res.status(400).json({ message: `Transaction cannot be accepted in its current state (${transaction.status})` });

        const donation = transaction.donation;
        const requestNeed = transaction.requestNeed;

        // Update product quantities if category is packaged_products
        if (donation.category === 'packaged_products') {
            for (const allocatedProduct of transaction.allocatedProducts) {
                const donationProduct = donation.products.find(p => p.product.toString() === allocatedProduct.product._id.toString());
                if (donationProduct) {
                    donationProduct.quantity -= allocatedProduct.quantity;
                    if (donationProduct.quantity < 0) donationProduct.quantity = 0;
                }
            }

            // Update donation status
            const remainingProducts = donation.products.reduce((sum, p) => sum + p.quantity, 0);
            donation.status = remainingProducts === 0 ? 'fulfilled' : 'partially_fulfilled';
        }

        // Update meal quantities if category is prepared_meals
        if (donation.category === 'prepared_meals') {
            let totalAllocatedMeals = 0;
            for (const allocatedMeal of transaction.allocatedMeals) {
                const donationMeal = donation.meals.find(m => m.meal.toString() === allocatedMeal.meal._id.toString());
                if (donationMeal) {
                    donationMeal.quantity -= allocatedMeal.quantity;
                    if (donationMeal.quantity < 0) donationMeal.quantity = 0;
                    totalAllocatedMeals += allocatedMeal.quantity;
                }
            }

            // Update remainingMeals and numberOfMeals
            donation.remainingMeals = (donation.remainingMeals || donation.numberOfMeals) - totalAllocatedMeals;
            if (donation.remainingMeals < 0) donation.remainingMeals = 0;
            donation.status = donation.remainingMeals === 0 ? 'fulfilled' : 'partially_fulfilled';

            // Update requestNeed numberOfMeals
            requestNeed.numberOfMeals -= totalAllocatedMeals;
            if (requestNeed.numberOfMeals < 0) requestNeed.numberOfMeals = 0;
            requestNeed.status = requestNeed.numberOfMeals === 0 ? 'fulfilled' : 'partially_fulfilled';
        }

        await donation.save();
        await requestNeed.save();

        transaction.status = 'approved';
        transaction.responseDate = new Date();
        await transaction.save();

        // Send notification to recipient
        const recipient = await User.findById(transaction.recipient);
        if (recipient && recipient.email) {
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
                to: recipient.email,
                subject: `Your Request "${requestNeed.title}" Has Been Fulfilled`,
                text: `Dear ${recipient.name || 'Recipient'},

Your request titled "${requestNeed.title}" has been fulfilled.

Details:
- Donation Title: ${donation.title}
- Status: ${requestNeed.status}

Thank you for using our platform!

Best regards,
Your Platform Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: black;">
                        <h2 style="color: #228b22;">Your Request Has Been Fulfilled</h2>
                        <p>Dear ${recipient.name || 'Recipient'},</p>
                        <p>Your request titled "<strong>${requestNeed.title}</strong>" has been fulfilled.</p>
                        <h3>Details:</h3>
                        <ul>
                            <li><strong>Donation Title:</strong> ${donation.title}</li>
                            <li><strong>Status:</strong> ${requestNeed.status}</li>
                        </ul>
                        <p>Thank you for using our platform!</p>
                        <p style="margin-top: 20px;">Best regards,<br>Your Platform Team</p>
                    </div>
                `,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${recipient.email}`);
        }

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

        // Validate input
        if (!transactionId) {
            return res.status(400).json({ message: 'Transaction ID is required' });
        }
        if (!rejectionReason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        // Find the transaction and populate related fields
        const transaction = await DonationTransaction.findById(transactionId)
            .populate({
                path: 'donation',
                populate: [
                    { path: 'donor' },
                    { path: 'meals.meal', model: 'Meals' },
                    { path: 'products.product', model: 'Product' },
                ],
            })
            .populate({
                path: 'requestNeed',
                populate: [
                    { path: 'recipient' },
                    { path: 'requestedProducts.product', model: 'Product' },
                ],
            })
            .populate('recipient')
            .populate('donor')
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check if the transaction is in a rejectable state
        if (transaction.status !== 'pending') {
            return res.status(400).json({
                message: `Transaction cannot be rejected in its current state (${transaction.status})`,
            });
        }

        // Update the transaction
        transaction.status = 'rejected';
        transaction.responseDate = new Date();
        transaction.rejectionReason = rejectionReason;
        await transaction.save();

        // Update the donation: Remove the requestNeed from linkedRequests
        const donation = transaction.donation;
        if (donation) {
            donation.linkedRequests = donation.linkedRequests.filter(
                (reqId) => reqId.toString() !== transaction.requestNeed._id.toString()
            );
            // Check if there are other pending/accepted transactions for this donation
            const otherTransactions = await DonationTransaction.find({
                donation: donation._id,
                status: { $in: ['pending', 'approved'] },
            });
            donation.status = otherTransactions.length > 0 ? 'approved' : 'pending';
            await donation.save();
        }

        // Update the requestNeed: Remove the donation from linkedDonation
        const requestNeed = transaction.requestNeed;
        if (requestNeed) {
            requestNeed.linkedDonation = requestNeed.linkedDonation.filter(
                (donId) => donId.toString() !== transaction.donation._id.toString()
            );
            // Check if there are other pending/accepted transactions for this request
            const otherTransactions = await DonationTransaction.find({
                requestNeed: requestNeed._id,
                status: { $in: ['pending', 'approved'] },
            });
            requestNeed.status = otherTransactions.length > 0 ? 'partially_fulfilled' : 'pending';
            await requestNeed.save();
        }

        // Send notification to recipient
        const recipient = transaction.recipient || (requestNeed && requestNeed.recipient);
        if (recipient && recipient.email) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER || 'your-email@gmail.com',
                        pass: process.env.EMAIL_PASS || 'your-email-password',
                    },
                    tls: {
                        rejectUnauthorized: false,
                    },
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER || 'your-email@gmail.com',
                    to: recipient.email,
                    subject: `Your Request "${requestNeed.title}" Transaction Has Been Rejected`,
                    text: `Dear ${recipient.name || 'Recipient'},

We regret to inform you that a transaction for your request titled "${requestNeed.title}" has been rejected.

Details:
- Donation Title: ${donation.title}
- Rejection Reason: ${rejectionReason}

If you have any questions, please contact our support team.

Best regards,
Your Platform Team`,
                    html: `
                        <div style="font-family: Arial, sans-serif; color: black;">
                            <h2 style="color: #dc3545;">Your Request Transaction Has Been Rejected</h2>
                            <p>Dear ${recipient.name || 'Recipient'},</p>
                            <p>We regret to inform you that a transaction for your request titled "<strong>${requestNeed.title}</strong>" has been rejected.</p>
                            <h3>Details:</h3>
                            <ul>
                                <li><strong>Donation Title:</strong> ${donation.title}</li>
                                <li><strong>Rejection Reason:</strong> ${rejectionReason}</li>
                            </ul>
                            <p>If you have any questions, please contact our support team.</p>
                            <p style="margin-top: 20px;">Best regards,<br>Your Platform Team</p>
                        </div>
                    `,
                };

                await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${recipient.email}`);
            } catch (emailError) {
                console.error(`Failed to send email to ${recipient.email}:`, emailError.message);
            }
        }

        // Send notification to donor
        const donor = transaction.donor || (donation && donation.donor);
        if (donor && donor.email) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER || 'your-email@gmail.com',
                        pass: process.env.EMAIL_PASS || 'your-email-password',
                    },
                    tls: {
                        rejectUnauthorized: false,
                    },
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER || 'your-email@gmail.com',
                    to: donor.email,
                    subject: `Your Donation "${donation.title}" Transaction Has Been Rejected`,
                    text: `Dear ${donor.name || 'Donor'},

We regret to inform you that a transaction for your donation titled "${donation.title}" has been rejected.

Details:
- Request Title: ${requestNeed.title}
- Rejection Reason: ${rejectionReason}

If you have any questions, please contact our support team.

Best regards,
Your Platform Team`,
                    html: `
                        <div style="font-family: Arial, sans-serif; color: black;">
                            <h2 style="color: #dc3545;">Your Donation Transaction Has Been Rejected</h2>
                            <p>Dear ${donor.name || 'Donor'},</p>
                            <p>We regret to inform you that a transaction for your donation titled "<strong>${donation.title}</strong>" has been rejected.</p>
                            <h3>Details:</h3>
                            <ul>
                                <li><strong>Request Title:</strong> ${requestNeed.title}</li>
                                <li><strong>Rejection Reason:</strong> ${rejectionReason}</li>
                            </ul>
                            <p>If you have any questions, please contact our support team.</p>
                            <p style="margin-top: 20px;">Best regards,<br>Your Platform Team</p>
                        </div>
                    `,
                };

                await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${donor.email}`);
            } catch (emailError) {
                console.error(`Failed to send email to ${donor.email}:`, emailError.message);
            }
        }

        res.status(200).json({
            message: 'Transaction rejected successfully',
            transaction,
        });
    } catch (error) {
        console.error('Error rejecting transaction:', error);
        res.status(500).json({
            message: 'Failed to reject transaction',
            error: error.message,
        });
    }
}

// ✅ Create and accept a donation transaction
// ✅ Create and accept a donation transaction
// ✅ Create and accept a donation transaction
// ✅ Update and accept an existing donation transaction
async function createAndAcceptDonationTransaction(req, res) {
    try {
        const { donationId, requestNeedId, allocatedProducts = [], allocatedMeals = [] } = req.body;
        const user = req.user;

        // Validate input
        if (!donationId || !requestNeedId) {
            return res.status(400).json({ message: 'donationId and requestNeedId are required' });
        }

        // Find the existing transaction
        const transaction = await DonationTransaction.findOne({
            donation: donationId,
            requestNeed: requestNeedId,
            status: 'pending',
        })
            .populate({
                path: 'donation',
                populate: [
                    { path: 'donor' },
                    { path: 'meals.meal', model: 'Meals' },
                    { path: 'products.product', model: 'Product' },
                ],
            })
            .populate({
                path: 'requestNeed',
                populate: [
                    { path: 'recipient' },
                    { path: 'requestedProducts.product', model: 'Product' },
                    { path: 'requestedMeals.meal', model: 'Meals' },
                ],
            })
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal');

        if (!transaction) {
            return res.status(404).json({ message: 'Pending transaction not found for this donation and request' });
        }

        const donation = transaction.donation;
        const requestNeed = transaction.requestNeed;

        // Validate category match
        if (donation.category !== requestNeed.category) {
            return res.status(400).json({
                message: `Donation and request categories do not match (donation: ${donation.category}, request: ${requestNeed.category})`,
            });
        }

        let isFullyFulfilled = false;
        let finalAllocatedProducts = allocatedProducts.length ? allocatedProducts : transaction.allocatedProducts;
        let finalAllocatedMeals = allocatedMeals.length ? allocatedMeals : transaction.allocatedMeals;

        // Handle prepared meals
        if (donation.category === 'prepared_meals') {
            if (!finalAllocatedMeals.length) {
                return res.status(400).json({ message: 'No meals allocated for this request' });
            }

            let totalAllocated = 0;
            for (const allocated of finalAllocatedMeals) {
                const donationMeal = donation.meals.find((m) =>
                    m.meal && allocated.meal && m.meal._id.toString() === allocated.meal._id.toString()
                );
                if (!donationMeal) {
                    console.error('Meal not found in donation:', {
                        allocatedMeal: allocated,
                        donationMeals: donation.meals,
                    });
                    return res.status(400).json({
                        message: `Meal ${allocated.meal?._id || allocated.meal} not found in donation`,
                    });
                }
                if (allocated.quantity > donationMeal.quantity) {
                    return res.status(400).json({
                        message: `Requested quantity (${allocated.quantity}) exceeds available quantity (${donationMeal.quantity}) for meal ${allocated.meal._id}`,
                    });
                }
                donationMeal.quantity -= allocated.quantity;
                totalAllocated += allocated.quantity;
            }

            // Remove meals with quantity 0
            donation.meals = donation.meals.filter((m) => m.quantity > 0);

            donation.remainingMeals = (donation.remainingMeals || donation.numberOfMeals) - totalAllocated;
            if (donation.remainingMeals < 0) donation.remainingMeals = 0;
            isFullyFulfilled = donation.remainingMeals === 0;
            // Update donation status: partially_fulfilled if remainingMeals > 0, fulfilled if remainingMeals === 0
            donation.status = isFullyFulfilled ? 'fulfilled' : 'partially_fulfilled';

            // Update request numberOfMeals
            requestNeed.numberOfMeals -= totalAllocated;
            if (requestNeed.numberOfMeals < 0) requestNeed.numberOfMeals = 0;
            requestNeed.status = requestNeed.numberOfMeals === 0 ? 'fulfilled' : 'partially_fulfilled';
        }

        // Handle packaged products
        if (donation.category === 'packaged_products') {
            if (!finalAllocatedProducts.length) {
                return res.status(400).json({ message: 'No products allocated for this request' });
            }

            for (const allocated of finalAllocatedProducts) {
                const donationProduct = donation.products.find((p) =>
                    p.product && allocated.product && p.product._id.toString() === allocated.product._id.toString()
                );
                if (!donationProduct) {
                    console.error('Product not found in donation:', {
                        allocatedProduct: allocated,
                        donationProducts: donation.products,
                    });
                    return res.status(400).json({
                        message: `Product ${allocated.product?._id || allocated.product} not found in donation`,
                    });
                }
                if (allocated.quantity > donationProduct.quantity) {
                    return res.status(400).json({
                        message: `Requested quantity (${allocated.quantity}) exceeds available quantity (${donationProduct.quantity}) for product ${allocated.product._id}`,
                    });
                }
                donationProduct.quantity -= allocated.quantity;

                const requestProduct = requestNeed.requestedProducts.find((rp) =>
                    rp.product && allocated.product && rp.product._id.toString() === allocated.product._id.toString()
                );
                if (requestProduct) {
                    requestProduct.quantity -= allocated.quantity;
                    if (requestProduct.quantity < 0) requestProduct.quantity = 0;
                }
            }

            donation.products = donation.products.filter((p) => p.quantity > 0);
            const remainingProducts = donation.products.reduce((sum, p) => sum + p.quantity, 0);
            isFullyFulfilled = remainingProducts === 0;
            // Update donation status: partially_fulfilled if remainingProducts > 0, fulfilled if remainingProducts === 0
            donation.status = isFullyFulfilled ? 'fulfilled' : 'partially_fulfilled';

            const remainingRequestProducts = requestNeed.requestedProducts.reduce(
                (sum, rp) => sum + rp.quantity,
                0
            );
            requestNeed.status = remainingRequestProducts === 0 ? 'fulfilled' : 'partially_fulfilled';
        }

        // Ensure bidirectional linking
        donation.linkedRequests = donation.linkedRequests || [];
        if (!donation.linkedRequests.includes(requestNeedId)) {
            donation.linkedRequests.push(requestNeedId);
        }

        requestNeed.linkedDonation = requestNeed.linkedDonation || [];
        if (!requestNeed.linkedDonation.includes(donationId)) {
            requestNeed.linkedDonation.push(donationId);
        }

        // Save the updated donation and request
        await donation.save();
        await requestNeed.save();

        // Update the transaction
        transaction.status = 'approved';
        transaction.responseDate = new Date();
        transaction.allocatedProducts = finalAllocatedProducts;
        transaction.allocatedMeals = finalAllocatedMeals;
        await transaction.save();

        // Send email notifications
        if (donation.donor && donation.donor.email) {
            const subject = `Your Donation "${donation.title}" Has Been Accepted`;
            let allocatedItemsText = '';
            if (donation.category === 'prepared_meals') {
                allocatedItemsText = finalAllocatedMeals
                    .map((am) => {
                        const meal = donation.meals.find((m) =>
                            m.meal && am.meal && m.meal._id.toString() === am.meal._id.toString()
                        )?.meal;
                        return `${meal?.mealName || 'Unknown Meal'} (Quantity: ${am.quantity})`;
                    })
                    .join(', ');
            } else if (donation.category === 'packaged_products') {
                allocatedItemsText = finalAllocatedProducts
                    .map((ap) => {
                        const product = donation.products.find((p) =>
                            p.product && ap.product && p.product._id.toString() === ap.product._id.toString()
                        )?.product;
                        return `${product?.name || 'Unknown Product'} (Quantity: ${ap.quantity})`;
                    })
                    .join(', ');
            }

            const text = `Dear ${donation.donor.name || 'Donor'},

Your donation titled "${donation.title}" has been accepted.

Donation Details:
- Title: ${donation.title}
- Request: ${requestNeed.title}
- Allocated Items: ${allocatedItemsText}
- Accepted On: ${new Date().toLocaleDateString()}
- Status: ${donation.status}

Thank you for your generosity!

Best regards,
Your Platform Team`;

            const html = `
                <div style="font-family: Arial, sans-serif; color: black;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="cid:logo" alt="Platform Logo" style="max-width: 150px; height: auto;" />
                    </div>
                    <h2 style="color: #228b22;">Your Donation Has Been Accepted</h2>
                    <p>Dear ${donation.donor.name || 'Donor'},</p>
                    <p>Your donation titled "<strong>${donation.title}</strong>" has been accepted.</p>
                    <h3>Donation Details:</h3>
                    <ul>
                        <li><strong>Title:</strong> ${donation.title}</li>
                        <li><strong>Request:</strong> ${requestNeed.title}</li>
                        <li><strong>Allocated Items:</strong> ${allocatedItemsText}</li>
                        <li><strong>Accepted On:</strong> ${new Date().toLocaleDateString()}</li>
                        <li><strong>Status:</strong> ${donation.status}</li>
                    </ul>
                    <p>Thank you for your generosity!</p>
                    <p style="margin-top: 20px;">Best regards,<br>Your Platform Team</p>
                </div>
            `;

            const attachments = [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, '../uploads/logo.png'),
                    cid: 'logo',
                },
            ];

            await sendEmail(donation.donor.email, subject, text, html, attachments);
        }

        const recipient = requestNeed.recipient;
        if (recipient && recipient.email) {
            const subject = `Your Request "${requestNeed.title}" Has Been Fulfilled`;
            const text = `Dear ${recipient.name || 'Recipient'},

Your request titled "${requestNeed.title}" has been fulfilled.

Details:
- Donation Title: ${donation.title}
- Status: ${requestNeed.status}

Thank you for using our platform!

Best regards,
Your Platform Team`;

            const html = `
                <div style="font-family: Arial, sans-serif; color: black;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="cid:logo" alt="Platform Logo" style="max-width: 150px; height: auto;" />
                    </div>
                    <h2 style="color: #228b22;">Your Request Has Been Fulfilled</h2>
                    <p>Dear ${recipient.name || 'Recipient'},</p>
                    <p>Your request titled "<strong>${requestNeed.title}</strong>" has been fulfilled.</p>
                    <h3>Details:</h3>
                    <ul>
                        <li><strong>Donation Title:</strong> ${donation.title}</li>
                        <li><strong>Status:</strong> ${requestNeed.status}</li>
                    </ul>
                    <p>Thank you for using our platform!</p>
                    <p style="margin-top: 20px;">Best regards,<br>Your Platform Team</p>
                </div>
            `;

            const attachments = [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, '../uploads/logo.png'),
                    cid: 'logo',
                },
            ];

            await sendEmail(recipient.email, subject, text, html, attachments);
        }

        res.status(200).json({
            message: 'Transaction accepted successfully',
            donation,
            request: requestNeed,
            transaction,
        });
    } catch (error) {
        console.error('Error accepting transaction:', error);
        res.status(500).json({
            message: 'Failed to accept transaction',
            error: error.message,
        });
    }
}

// ✅ Create and accept a donation transaction
// ✅ Update and accept an existing donation transaction (bidirectional)
// In donationTransactionController.js
async function createAndAcceptDonationTransactionBiderc(req, res) {
    try {
        const { donationId, requestNeedId, allocatedProducts = [], allocatedMeals = [] } = req.body;
        const user = req.user;

        // Validate input
        if (!donationId || !requestNeedId) {
            return res.status(400).json({ message: 'donationId and requestNeedId are required' });
        }

        // Find the existing transaction
        const transaction = await DonationTransaction.findOne({
            donation: donationId,
            requestNeed: requestNeedId,
            status: 'pending',
        })
            .populate({
                path: 'donation',
                populate: [
                    { path: 'donor' },
                    { path: 'meals.meal', model: 'Meals' },
                    { path: 'products.product', model: 'Product' }, // Ensure products are populated
                ],
            })
            .populate('requestNeed')
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal');

        if (!transaction) {
            return res.status(404).json({ message: 'Pending transaction not found for this donation and request' });
        }

        const donation = transaction.donation;
        const requestNeed = transaction.requestNeed;

        // Validate category match
        if (donation.category !== requestNeed.category) {
            return res.status(400).json({
                message: `Donation and request categories do not match (donation: ${donation.category}, request: ${requestNeed.category})`,
            });
        }

        let isFullyFulfilled = false;
        let finalAllocatedProducts = allocatedProducts.length ? allocatedProducts : transaction.allocatedProducts;
        let finalAllocatedMeals = allocatedMeals.length ? allocatedMeals : transaction.allocatedMeals;

        // Handle prepared meals
        if (donation.category === 'prepared_meals') {
            if (!finalAllocatedMeals.length) {
                return res.status(400).json({ message: 'No meals allocated for this request' });
            }

            let totalAllocated = 0;
            for (const allocated of finalAllocatedMeals) {
                const donationMeal = donation.meals.find((m) =>
                    m.meal && allocated.meal && m.meal._id.toString() === allocated.meal._id.toString()
                );
                if (!donationMeal) {
                    console.error('Meal not found in donation:', {
                        allocatedMeal: allocated,
                        donationMeals: donation.meals,
                    });
                    return res.status(400).json({
                        message: `Meal ${allocated.meal?._id || allocated.meal} not found in donation`,
                    });
                }
                if (allocated.quantity > donationMeal.quantity) {
                    return res.status(400).json({
                        message: `Requested quantity (${allocated.quantity}) exceeds available quantity (${donationMeal.quantity}) for meal ${allocated.meal._id}`,
                    });
                }
                donationMeal.quantity -= allocated.quantity;
                totalAllocated += allocated.quantity;
            }

            // Remove meals with quantity 0
            donation.meals = donation.meals.filter((m) => m.quantity > 0);

            donation.remainingMeals = (donation.remainingMeals || donation.numberOfMeals) - totalAllocated;
            if (donation.remainingMeals < 0) donation.remainingMeals = 0;
            isFullyFulfilled = donation.remainingMeals === 0;
            donation.status = isFullyFulfilled ? 'fulfilled' : 'approved';

            // Update request numberOfMeals
            requestNeed.numberOfMeals -= totalAllocated;
            if (requestNeed.numberOfMeals < 0) requestNeed.numberOfMeals = 0;
            requestNeed.status = requestNeed.numberOfMeals === 0 ? 'fulfilled' : 'partially_fulfilled';
        }

        // Handle packaged products
        if (donation.category === 'packaged_products') {
            if (!finalAllocatedProducts.length) {
                return res.status(400).json({ message: 'No products allocated for this request' });
            }

            for (const allocated of finalAllocatedProducts) {
                // Log the allocated product for debugging
                console.log('Allocated Product:', allocated);

                // Find the product in the donation's products array
                const donationProduct = donation.products.find((p) =>
                    p.product && allocated.product && p.product._id.toString() === allocated.product._id.toString()
                );

                if (!donationProduct) {
                    console.error('Product not found in donation:', {
                        allocatedProduct: allocated,
                        donationProducts: donation.products,
                    });
                    return res.status(400).json({
                        message: `Product ${allocated.product?._id || allocated.product} not found in donation`,
                    });
                }

                if (allocated.quantity > donationProduct.quantity) {
                    return res.status(400).json({
                        message: `Requested quantity (${allocated.quantity}) exceeds available quantity (${donationProduct.quantity}) for product ${allocated.product._id}`,
                    });
                }

                donationProduct.quantity -= allocated.quantity;

                // Update the request's requestedProducts
                const requestProduct = requestNeed.requestedProducts.find((rp) =>
                    rp.product && allocated.product && rp.product._id.toString() === allocated.product._id.toString()
                );
                if (requestProduct) {
                    requestProduct.quantity -= allocated.quantity;
                    if (requestProduct.quantity < 0) requestProduct.quantity = 0;
                }
            }

            // Remove products with quantity 0
            donation.products = donation.products.filter((p) => p.quantity > 0);
            const remainingProducts = donation.products.reduce((sum, p) => sum + p.quantity, 0);
            isFullyFulfilled = remainingProducts === 0;
            donation.status = isFullyFulfilled ? 'fulfilled' : 'approved';

            const remainingRequestProducts = requestNeed.requestedProducts.reduce(
                (sum, rp) => sum + rp.quantity,
                0
            );
            requestNeed.status = remainingRequestProducts === 0 ? 'fulfilled' : 'partially_fulfilled';
        }

        // Ensure bidirectional linking
        donation.linkedRequests = donation.linkedRequests || [];
        if (!donation.linkedRequests.includes(requestNeedId)) {
            donation.linkedRequests.push(requestNeedId);
        }

        requestNeed.linkedDonation = requestNeed.linkedDonation || [];
        if (!requestNeed.linkedDonation.includes(donationId)) {
            requestNeed.linkedDonation.push(donationId);
        }

        // Save the updated donation and request
        await donation.save();
        await requestNeed.save();

        // Update the transaction
        transaction.status = 'approved';
        transaction.responseDate = new Date();
        transaction.allocatedProducts = finalAllocatedProducts;
        transaction.allocatedMeals = finalAllocatedMeals;
        await transaction.save();

        // Send email notifications
        if (donation.donor && donation.donor.email) {
            const subject = `Your Donation "${donation.title}" Has Been Accepted`;
            let allocatedItemsText = '';
            if (donation.category === 'prepared_meals') {
                allocatedItemsText = finalAllocatedMeals
                    .map((am) => {
                        const meal = donation.meals.find((m) =>
                            m.meal && am.meal && m.meal._id.toString() === am.meal._id.toString()
                        )?.meal;
                        return `${meal?.mealName || 'Unknown Meal'} (Quantity: ${am.quantity})`;
                    })
                    .join(', ');
            } else if (donation.category === 'packaged_products') {
                allocatedItemsText = finalAllocatedProducts
                    .map((ap) => {
                        const product = donation.products.find((p) =>
                            p.product && ap.product && p.product._id.toString() === ap.product._id.toString()
                        )?.product;
                        return `${product?.name || 'Unknown Product'} (Quantity: ${ap.quantity})`;
                    })
                    .join(', ');
            }

            const text = `Dear ${donation.donor.name || 'Donor'},

Your donation titled "${donation.title}" has been accepted.

Donation Details:
- Title: ${donation.title}
- Request: ${requestNeed.title}
- Allocated Items: ${allocatedItemsText}
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
                    <p>Dear ${donation.donor.name || 'Donor'},</p>
                    <p>Your donation titled "<strong>${donation.title}</strong>" has been accepted.</p>
                    <h3>Donation Details:</h3>
                    <ul>
                        <li><strong>Title:</strong> ${donation.title}</li>
                        <li><strong>Request:</strong> ${requestNeed.title}</li>
                        <li><strong>Allocated Items:</strong> ${allocatedItemsText}</li>
                        <li><strong>Accepted On:</strong> ${new Date().toLocaleDateString()}</li>
                    </ul>
                    <p>Thank you for your generosity!</p>
                    <p style="margin-top: 20px;">Best regards,<br>Your Platform Team</p>
                </div>
            `;

            const attachments = [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, '../uploads/logo.png'),
                    cid: 'logo',
                },
            ];

            await sendEmail(donation.donor.email, subject, text, html, attachments);
        }

        const recipient = await User.findById(requestNeed.recipient);
        if (recipient && recipient.email) {
            const subject = `Your Request "${requestNeed.title}" Has Been Fulfilled`;
            const text = `Dear ${recipient.name || 'Recipient'},

Your request titled "${requestNeed.title}" has been fulfilled.

Details:
- Donation Title: ${donation.title}
- Status: ${requestNeed.status}

Thank you for using our platform!

Best regards,
Your Platform Team`;

            const html = `
                <div style="font-family: Arial, sans-serif; color: black;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="cid:logo" alt="Platform Logo" style="max-width: 150px; height: auto;" />
                    </div>
                    <h2 style="color: #228b22;">Your Request Has Been Fulfilled</h2>
                    <p>Dear ${recipient.name || 'Recipient'},</p>
                    <p>Your request titled "<strong>${requestNeed.title}</strong>" has been fulfilled.</p>
                    <h3>Details:</h3>
                    <ul>
                        <li><strong>Donation Title:</strong> ${donation.title}</li>
                        <li><strong>Status:</strong> ${requestNeed.status}</li>
                    </ul>
                    <p>Thank you for using our platform!</p>
                    <p style="margin-top: 20px;">Best regards,<br>Your Platform Team</p>
                </div>
            `;

            const attachments = [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, '../uploads/logo.png'),
                    cid: 'logo',
                },
            ];

            await sendEmail(recipient.email, subject, text, html, attachments);
        }

        res.status(200).json({
            message: 'Transaction accepted successfully',
            donation,
            request: requestNeed,
            transaction,
        });
    } catch (error) {
        console.error('Error accepting transaction:', error);
        res.status(500).json({
            message: 'Failed to accept transaction',
            error: error.message,
        });
    }
}
// ✅ Check request fulfillment
async function checkRequestFulfillment(requestId) {
    const request = await RequestNeed.findById(requestId)
      .populate('requestedProducts')
      .populate('requestedMeals');
    const transactions = await DonationTransaction.find({ 
      requestNeed: requestId, 
      status: 'approved' 
    })
      .populate('allocatedProducts.product')
      .populate('allocatedMeals.meal');
  
    let isFullyFulfilled = false;
  
    if (request.category === 'packaged_products') {
      const requestedMap = new Map(request.requestedProducts.map(p => [p._id.toString(), p.totalQuantity]));
      const allocatedMap = new Map();
  
      transactions.forEach(t => {
        t.allocatedProducts.forEach(ap => {
          const productId = ap.product._id.toString();
          allocatedMap.set(productId, (allocatedMap.get(productId) || 0) + ap.quantity);
        });
      });
  
      isFullyFulfilled = [...requestedMap].every(([productId, requestedQty]) => 
        (allocatedMap.get(productId) || 0) >= requestedQty
      );
    } else if (request.category === 'prepared_meals') {
      const totalRequestedMeals = request.numberOfMeals;
      let totalAllocatedMeals = 0;
  
      transactions.forEach(t => {
        t.allocatedMeals.forEach(am => {
          totalAllocatedMeals += am.quantity;
        });
      });
  
      // Update request.numberOfMeals based on total allocated meals
      request.numberOfMeals = totalRequestedMeals - totalAllocatedMeals;
      if (request.numberOfMeals < 0) request.numberOfMeals = 0;
  
      isFullyFulfilled = request.numberOfMeals === 0;
    }
  
    request.status = isFullyFulfilled ? 'fulfilled' : 'partially_fulfilled';
    await request.save();
    console.log('checkRequestFulfillment updated request:', request);
  }

// ✅ Reject a donation directly (without a transaction)
async function rejectDonation(req, res) {
    try {
        const { donationId } = req.params;
        const { rejectionReason } = req.body;

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        const donor = await User.findById(donation.donor);
        if (!donor) return res.status(404).json({ message: 'Donor not found' });

        if (donation.status !== 'pending') {
            return res.status(400).json({ 
                message: `Donation cannot be rejected in its current state (${donation.status})`
            });
        }

        donation.status = 'rejected';
        donation.rejectionReason = rejectionReason || 'No reason provided';
        await donation.save();

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
                    path: path.join(__dirname, '../uploads/logo.png'),
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
async function getDonationTransactionsByDonorId(req, res) {
    try {
        const { donorId } = req.params;

        // First, find all donations by the donor
        const donations = await Donation.find({ donor: donorId }).select('_id');

        if (!donations.length) {
            return res.status(404).json({ message: 'No donations found for this donor' });
        }

        // Extract donation IDs
        const donationIds = donations.map(d => d._id);

        // Find transactions associated with these donations
        const transactions = await DonationTransaction.find({ donation: { $in: donationIds } })
            .populate({
                path: 'donation',
                populate: [
                    { path: 'donor', select: 'name photo' }, // Select only name and photo
                    { path: 'meals.meal', model: 'Meals' },
                    { path: 'products.product', model: 'Product' },
                ],
            })
            .populate({
                path: 'requestNeed',
                populate: [
                    { path: 'recipient' },
                    { path: 'requestedProducts.product', model: 'Product' },
                    { path: 'requestedMeals.meal', model: 'Meals' },
                ],
            })
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal');

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found for this donor' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions by donor:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function getTransactionsByRecipientId(req, res) {
    try {
        const { recipientId } = req.params;
        const transactions = await DonationTransaction.find({ recipient: recipientId })
            .populate({
                path: 'requestNeed',
                populate: [
                    { path: 'recipient', select: 'name photo' },
                    { path: 'requestedProducts.product', model: 'Product' },
                    { path: 'requestedMeals.meal', model: 'Meals' },
                ],
            })
            .populate({
                path: 'donation',
                populate: [
                    { path: 'donor', select: 'name photo' },
                    { path: 'meals.meal', model: 'Meals' },
                    { path: 'products.product', model: 'Product' },
                ],
            })
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal')
            .populate('donor');


        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found for this recipient' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions by recipient:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
module.exports = {
    getAllDonationTransactions,
    getDonationTransactionById,
    getDonationTransactionsByRequestNeedId,
    getDonationTransactionsByDonationId,
    getDonationTransactionsByDonorId,
    getDonationTransactionsByStatus,
    createDonationTransaction,
    updateDonationTransaction,
    deleteDonationTransaction,
    getTransactionsByRecipientId,
    acceptDonationTransaction,
    rejectDonationTransaction,
    createAndAcceptDonationTransaction,
    rejectDonation,
    createAndAcceptDonationTransactionBiderc,
};