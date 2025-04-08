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
async function getDonationTransactionsByRequestNeedId(req, res) {
    try {
        const { requestNeedId } = req.params;
        const transactions = await DonationTransaction.find({ requestNeed: requestNeedId })
            .populate('donation')
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal'); // Populate allocatedMeals

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
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal'); // Populate allocatedMeals

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
async function getTransactionsByRecipientId(req, res) {
    try {
        const { recipientId } = req.params;
        const transactions = await DonationTransaction.find({ recipient: recipientId })
            .populate('requestNeed')
            .populate('donation')
            .populate('allocatedProducts.product')
            .populate('allocatedMeals.meal') // Populate allocatedMeals
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

        const transaction = await DonationTransaction.findById(transactionId)
            .populate('donation')
            .populate('requestNeed');
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ 
                message: `Transaction cannot be rejected in its current state (${transaction.status})`
            });
        }

        transaction.status = 'rejected';
        transaction.responseDate = new Date();
        transaction.rejectionReason = rejectionReason || 'No reason provided';
        await transaction.save();

        const donation = transaction.donation;
        if (donation) {
            donation.status = 'rejected';
            await donation.save();
        }

        const requestNeed = transaction.requestNeed;
        if (requestNeed) {
            requestNeed.status = 'rejected';
            await requestNeed.save();
        }

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
                subject: `Your Request "${requestNeed.title}" Has Been Rejected`,
                text: `Dear ${recipient.name || 'Recipient'},

We regret to inform you that your request titled "${requestNeed.title}" has been rejected.

Details:
- Donation Title: ${donation.title}
- Rejection Reason: ${rejectionReason || 'No reason provided'}

If you have any questions, please contact our support team.

Best regards,
Your Platform Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: black;">
                        <h2 style="color: #dc3545;">Your Request Has Been Rejected</h2>
                        <p>Dear ${recipient.name || 'Recipient'},</p>
                        <p>We regret to inform you that your request titled "<strong>${requestNeed.title}</strong>" has been rejected.</p>
                        <h3>Details:</h3>
                        <ul>
                            <li><strong>Donation Title:</strong> ${donation.title}</li>
                            <li><strong>Rejection Reason:</strong> ${rejectionReason || 'No reason provided'}</li>
                        </ul>
                        <p>If you have any questions, please contact our support team.</p>
                        <p style="margin-top: 20px;">Best regards,<br>Your Platform Team</p>
                    </div>
                `,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${recipient.email}`);
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

// ✅ Create and accept a donation transaction
// ✅ Create and accept a donation transaction
// ✅ Create and accept a donation transaction
async function createAndAcceptDonationTransaction(req, res) {
    try {
        const { donationId, requestNeedId, allocatedProducts = [], allocatedMeals = [] } = req.body;
        const user = req.user;

        // Validate input
        if (!donationId || !requestNeedId) {
            return res.status(400).json({ message: 'donationId and requestNeedId are required' });
        }

        // Fetch donation with necessary data
        const donation = await Donation.findById(donationId)
            .populate('donor')
            .populate('products.product')
            .populate('meals.meal');
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        // Only check if donation is fulfilled
        if (donation.status === 'fulfilled') {
            return res.status(400).json({ 
                message: 'Donation is already completely fulfilled' 
            });
        }

        // Fetch request with necessary data
        const requestNeed = await RequestNeed.findById(requestNeedId)
            .populate('recipient')
            .populate('requestedProducts.product')
            .populate('requestedMeals.meal');
        if (!requestNeed) return res.status(404).json({ message: 'RequestNeed not found' });

        // Validate category match
        if (donation.category !== requestNeed.category) {
            return res.status(400).json({ message: 'Donation and request categories do not match' });
        }

        let isFullyFulfilled = false;

        // Handle packaged products
        if (donation.category === 'packaged_products') {
            if (!allocatedProducts.length) {
                return res.status(400).json({ message: 'No products allocated for this request' });
            }

            // Validate and update quantities
            for (const allocated of allocatedProducts) {
                const donationProduct = donation.products.find(p => 
                    p.product._id.toString() === allocated.product
                );
                
                if (!donationProduct) {
                    return res.status(400).json({ 
                        message: `Product ${allocated.product} not found in donation` 
                    });
                }

                if (allocated.quantity > donationProduct.quantity) {
                    return res.status(400).json({
                        message: `Requested quantity (${allocated.quantity}) exceeds available quantity (${donationProduct.quantity})`
                    });
                }

                // Update donation quantity
                donationProduct.quantity -= allocated.quantity;
            }

            // Check if fully fulfilled
            const remainingProducts = donation.products.reduce((sum, p) => sum + p.quantity, 0);
            isFullyFulfilled = remainingProducts === 0;
            donation.status = isFullyFulfilled ? 'fulfilled' : 'approved';
        }

        // Handle prepared meals
        if (donation.category === 'prepared_meals') {
            if (!allocatedMeals.length) {
                return res.status(400).json({ message: 'No meals allocated for this request' });
            }
            for (const allocated of allocatedMeals) {
                const donationMeal = donation.meals.find(m => 
                    m.meal._id.toString() === allocated.meal
                );
                if (!donationMeal) {
                    return res.status(400).json({ 
                        message: `Meal ${allocated.meal} not found in donation` 
                    });
                }
                if (allocated.quantity > donationMeal.quantity) {
                    return res.status(400).json({
                        message: `Requested quantity (${allocated.quantity}) exceeds available quantity (${donationMeal.quantity})`
                    });
                }
                donationMeal.quantity -= allocated.quantity;
            }
            const totalAllocated = allocatedMeals.reduce((sum, m) => sum + m.quantity, 0);
            donation.remainingMeals = (donation.remainingMeals || donation.numberOfMeals) - totalAllocated;
            if (donation.remainingMeals < 0) donation.remainingMeals = 0;
            isFullyFulfilled = donation.remainingMeals === 0;
            donation.status = isFullyFulfilled ? 'fulfilled' : 'approved';
        }

        await donation.save();

        // Update request status
        requestNeed.status = isFullyFulfilled ? 'fulfilled' : 'approved';
        await requestNeed.save();

        // Create transaction
        const counter = await Counter.findOneAndUpdate(
            { _id: 'DonationTransactionId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        if (!counter) throw new Error('Failed to increment DonationTransactionId counter');

        const transaction = new DonationTransaction({
            id: counter.seq,
            donation: donationId,
            requestNeed: requestNeedId,
            donor: donation.donor,
            recipient: requestNeed.recipient,
            allocatedProducts,
            allocatedMeals,
            status: 'approved',
            responseDate: new Date()
        });

        await transaction.save();

        // Send email notification to donor
        if (donation.donor.email) {
            const subject = `Your Donation "${donation.title}" Has Been Accepted`;
            let allocatedItemsText = '';
            
            if (donation.category === 'packaged_products') {
                allocatedItemsText = allocatedProducts.map(ap => {
                    const product = donation.products.find(p => 
                        p.product._id.toString() === ap.product
                    )?.product;
                    return `${product?.name || 'Unknown Product'} (Quantity: ${ap.quantity})`;
                }).join(', ');
            } else if (donation.category === 'prepared_meals') {
                allocatedItemsText = allocatedMeals.map(am => {
                    const meal = donation.meals.find(m => 
                        m.meal._id.toString() === am.meal
                    )?.meal;
                    return `${meal?.mealName || 'Unknown Meal'} (Quantity: ${am.quantity})`;
                }).join(', ');
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

        res.status(201).json({ 
            message: 'Transaction created successfully',
            donation,
            request: requestNeed,
            transaction
        });

    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ 
            message: 'Failed to create transaction', 
            error: error.message 
        });
    }
}

// ✅ Create and accept a donation transaction
async function createAndAcceptDonationTransactionBiderc(req, res) {
    try {
        const { donationId, requestNeedId, allocatedProducts = [], allocatedMeals = [] } = req.body;
        const user = req.user;

        // Validate input
        if (!donationId || !requestNeedId) {
            return res.status(400).json({ message: 'donationId and requestNeedId are required' });
        }

        // Fetch donation with necessary data
        const donation = await Donation.findById(donationId)
            .populate('donor')
            .populate('products.product')
            .populate('meals.meal');
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        // Check if donation is already fulfilled
        if (donation.status === 'fulfilled') {
            return res.status(400).json({ 
                message: 'Donation is already completely fulfilled' 
            });
        }

        // Fetch request with necessary data
        const requestNeed = await RequestNeed.findById(requestNeedId)
            .populate('recipient')
            .populate('requestedProducts.product')
            .populate('requestedMeals.meal');
        if (!requestNeed) return res.status(404).json({ message: 'RequestNeed not found' });

        // Validate category match
        if (donation.category !== requestNeed.category) {
            return res.status(400).json({ 
                message: `Donation and request categories do not match (donation: ${donation.category}, request: ${requestNeed.category})` 
            });
        }

        let isFullyFulfilled = false;
        let finalAllocatedProducts = allocatedProducts;
        let finalAllocatedMeals = allocatedMeals;

        // Handle packaged products
        if (donation.category === 'packaged_products') {
            // Validate that the donation has products
            if (!donation.products || donation.products.length === 0) {
                return res.status(400).json({ 
                    message: 'Donation has no products to allocate' 
                });
            }

            // If allocatedProducts is not provided, allocate all available products from the donation
            if (!allocatedProducts.length) {
                finalAllocatedProducts = donation.products.map(product => ({
                    product: product.product._id.toString(),
                    quantity: product.quantity
                }));
            }

            // Validate and update quantities
            for (const allocated of finalAllocatedProducts) {
                const donationProduct = donation.products.find(p => 
                    p.product._id.toString() === allocated.product.toString()
                );
                
                if (!donationProduct) {
                    return res.status(400).json({ 
                        message: `Product ${allocated.product} not found in donation` 
                    });
                }

                if (allocated.quantity > donationProduct.quantity) {
                    return res.status(400).json({
                        message: `Requested quantity (${allocated.quantity}) exceeds available quantity (${donationProduct.quantity}) for product ${allocated.product}`
                    });
                }

                // Update donation quantity
                donationProduct.quantity -= allocated.quantity;

                // Update request quantity
                const requestProduct = requestNeed.requestedProducts.find(rp => 
                    rp.product._id.toString() === allocated.product.toString()
                );
                if (requestProduct) {
                    requestProduct.quantity -= allocated.quantity;
                    if (requestProduct.quantity < 0) requestProduct.quantity = 0;
                }
            }

            // Remove products with quantity 0
            donation.products = donation.products.filter(p => p.quantity > 0);

            // Check if donation is fully fulfilled
            const remainingProducts = donation.products.reduce((sum, p) => sum + p.quantity, 0);
            isFullyFulfilled = remainingProducts === 0;
            donation.status = isFullyFulfilled ? 'fulfilled' : 'approved';

            // Check if request is fully fulfilled
            const remainingRequestProducts = requestNeed.requestedProducts.reduce((sum, rp) => sum + rp.quantity, 0);
            requestNeed.status = remainingRequestProducts === 0 ? 'fulfilled' : 'partially_fulfilled';
        }

        // Handle prepared meals
        if (donation.category === 'prepared_meals') {
            // Validate that the donation has meals
            if (!donation.meals || donation.meals.length === 0) {
                return res.status(400).json({ 
                    message: 'Donation has no meals to allocate' 
                });
            }

            // If allocatedMeals is not provided, allocate all available meals from the donation
            if (!allocatedMeals.length) {
                finalAllocatedMeals = donation.meals.map(meal => ({
                    meal: meal.meal._id.toString(),
                    quantity: Math.min(meal.quantity, requestNeed.numberOfMeals) // Allocate up to the requested number of meals
                }));
            }

            let totalAllocated = 0;
            for (const allocated of finalAllocatedMeals) {
                const donationMeal = donation.meals.find(m => 
                    m.meal._id.toString() === allocated.meal.toString()
                );
                if (!donationMeal) {
                    return res.status(400).json({ 
                        message: `Meal ${allocated.meal} not found in donation` 
                    });
                }
                if (allocated.quantity > donationMeal.quantity) {
                    return res.status(400).json({
                        message: `Requested quantity (${allocated.quantity}) exceeds available quantity (${donationMeal.quantity}) for meal ${allocated.meal}`
                    });
                }
                donationMeal.quantity -= allocated.quantity;
                totalAllocated += allocated.quantity;
            }

            // Remove meals with quantity 0 to avoid validation error
            donation.meals = donation.meals.filter(m => m.quantity > 0);

            donation.remainingMeals = (donation.remainingMeals || donation.numberOfMeals) - totalAllocated;
            if (donation.remainingMeals < 0) donation.remainingMeals = 0;
            isFullyFulfilled = donation.remainingMeals === 0;
            donation.status = isFullyFulfilled ? 'fulfilled' : 'approved';

            // Update request numberOfMeals
            requestNeed.numberOfMeals -= totalAllocated;
            if (requestNeed.numberOfMeals < 0) requestNeed.numberOfMeals = 0;
            requestNeed.status = requestNeed.numberOfMeals === 0 ? 'fulfilled' : 'partially_fulfilled';
        }

        // Update bidirectional linking
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

        // Create transaction
        const counter = await Counter.findOneAndUpdate(
            { _id: 'DonationTransactionId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        if (!counter) throw new Error('Failed to increment DonationTransactionId counter');

        const transaction = new DonationTransaction({
            id: counter.seq,
            donation: donationId,
            requestNeed: requestNeedId,
            donor: donation.donor,
            recipient: requestNeed.recipient,
            allocatedProducts: finalAllocatedProducts,
            allocatedMeals: finalAllocatedMeals,
            status: 'approved',
            responseDate: new Date()
        });

        await transaction.save();

        // Send email notification to donor
        if (donation.donor.email) {
            const subject = `Your Donation "${donation.title}" Has Been Accepted`;
            let allocatedItemsText = '';
            
            if (donation.category === 'packaged_products') {
                allocatedItemsText = finalAllocatedProducts.map(ap => {
                    const product = donation.products.find(p => 
                        p.product._id.toString() === ap.product.toString()
                    )?.product;
                    return `${product?.name || 'Unknown Product'} (Quantity: ${ap.quantity})`;
                }).join(', ');
            } else if (donation.category === 'prepared_meals') {
                allocatedItemsText = finalAllocatedMeals.map(am => {
                    const meal = donation.meals.find(m => 
                        m.meal._id.toString() === am.meal.toString()
                    )?.meal;
                    return `${meal?.mealName || 'Unknown Meal'} (Quantity: ${am.quantity})`;
                }).join(', ');
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

        // Send email notification to recipient
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

        res.status(201).json({ 
            message: 'Transaction created successfully',
            donation,
            request: requestNeed,
            transaction
        });

    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ 
            message: 'Failed to create transaction', 
            error: error.message 
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
    createAndAcceptDonationTransactionBiderc,
};