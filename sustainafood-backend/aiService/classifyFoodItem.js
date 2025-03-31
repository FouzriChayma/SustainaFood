const fetch = require('node-fetch'); // For external API calls

// Mock AI classification (replace with real model integration)
async function classifyFoodItem({ name, description, category }) {
  const text = `${name} ${description}`.toLowerCase();
  
  // Example keyword-based classification (replace with NLP model)
  const productKeywords = {
    'Canned_Goods': ['canned', 'tin', 'soup'],
    'Dry_Goods': ['rice', 'pasta', 'flour'],
    'Beverages': ['water', 'juice', 'soda'],
    // Add more mappings from ProductType enum
  };
  const mealKeywords = {
    'Breakfast': ['cereal', 'pancake', 'oatmeal'],
    'Lunch': ['sandwich', 'salad', 'soup'],
    'Dinner': ['pasta', 'chicken', 'steak'],
    // Add more mappings from MealType enum
  };

  if (category === 'packaged_products') {
    for (const [type, keywords] of Object.entries(productKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        return { productType: type };
      }
    }
    return { productType: 'Other' };
  } else if (category === 'prepared_meals') {
    for (const [type, keywords] of Object.entries(mealKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        return { mealType: type };
      }
    }
    return { mealType: 'Other' };
  }
  throw new Error('Invalid category');
}

module.exports = { classifyFoodItem };