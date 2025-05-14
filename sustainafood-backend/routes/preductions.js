const express = require('express');
const axios = require('axios');
const router = express.Router();

const SUSTINIA_AI_URL = process.env.SUSTINIA_AI_SERVICE_URL || 'http://localhost:5002';
router.get('/forecast/donations', async (req, res) => {
  try {
    const days = req.query.days || 30;
    const response = await axios.get(`${SUSTINIA_AI_URL}/forecast/donations?days=${days}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching donation forecast:', error.message);
    res.status(500).json({ error: 'Failed to fetch donation forecast' });
  }
});

router.get('/forecast/requests', async (req, res) => {
  try {
    const days = req.query.days || 30;
    const response = await axios.get(`${SUSTINIA_AI_URL}/forecast/requests?days=${days}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching request forecast:', error.message);
    res.status(500).json({ error: 'Failed to fetch request forecast' });
  }
});

module.exports = router;