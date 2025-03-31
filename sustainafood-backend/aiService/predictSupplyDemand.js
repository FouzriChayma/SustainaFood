const Donation = require('../models/Donation');
const RequestNeed = require('../models/RequestNeed');

async function predictSupplyDemand(period = 'month') {
  try {
    console.log('Fetching donations and requests...');
    const donations = await Donation.find({ isaPost: true })
      .populate('products.product')
      .populate('meals.meal')
      .catch(err => {
        console.error('Error fetching donations:', err);
        return [];
      });
    const requests = await RequestNeed.find({ isaPost: true })
      .populate('requestedProducts.product')
      .populate('requestedMeals.meal')
      .catch(err => {
        console.error('Error fetching requests:', err);
        return [];
      });

    console.log('Donations:', donations.length, 'Requests:', requests.length);

    const supplyData = donations.reduce((acc, donation) => {
      const date = new Date(donation.createdAt || Date.now());
      const key = period === 'month' 
        ? `${date.getFullYear()}-${date.getMonth() + 1}` 
        : `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      if (!acc[key]) acc[key] = { products: 0, meals: 0 };
      if (donation.category === 'packaged_products' && Array.isArray(donation.products)) {
        acc[key].products += donation.products.reduce((sum, p) => sum + (p.quantity || 0), 0);
      } else if (donation.category === 'prepared_meals') {
        acc[key].meals += donation.numberOfMeals || 0;
      }
      return acc;
    }, {});

    const demandData = requests.reduce((acc, request) => {
      const date = new Date(request.created_at || Date.now());
      const key = period === 'month' 
        ? `${date.getFullYear()}-${date.getMonth() + 1}` 
        : `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      if (!acc[key]) acc[key] = { products: 0, meals: 0 };
      if (request.category === 'packaged_products' && Array.isArray(request.requestedProducts)) {
        acc[key].products += request.requestedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
      } else if (request.category === 'prepared_meals') {
        acc[key].meals += request.numberOfMeals || 0;
      }
      return acc;
    }, {});

    const futureKey = period === 'month' ? '2025-4' : '2025-W14';
    const latestSupply = supplyData[Object.keys(supplyData).pop()] || { products: 0, meals: 0 };
    const latestDemand = demandData[Object.keys(demandData).pop()] || { products: 0, meals: 0 };

    const result = {
      supply: {
        [futureKey]: {
          products: Math.round(latestSupply.products * 1.1),
          meals: Math.round(latestSupply.meals * 1.1),
        },
      },
      demand: {
        [futureKey]: {
          products: Math.round(latestDemand.products * 1.2),
          meals: Math.round(latestDemand.meals * 1.2),
        },
      },
    };

    console.log('Prediction Result:', result);
    return result;
  } catch (error) {
    console.error('predictSupplyDemand Error:', error.stack);
    throw error;
  }
}

module.exports = { predictSupplyDemand /* other exports */ };