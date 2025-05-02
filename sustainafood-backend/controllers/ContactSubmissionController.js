const ContactSubmission = require('../models/ContactSubmission');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, comment } = req.body;

    if (!name || !email || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newSubmission = new ContactSubmission({
      name,
      email,
      comment,
    });

    await newSubmission.save();
    res.status(201).json({ message: 'Form submitted successfully', submissionId: newSubmission._id });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting form', error: error.message });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await ContactSubmission.find().sort({ submittedAt: -1 });
    res.status(200).json({ data: submissions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
};