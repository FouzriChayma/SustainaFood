import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// Container for each card, ensuring same size across all cards
const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  min-height: 350px;
  border-left: 6px solid #228b22;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.15);
  }
`;

// Title with icon
const Title = styled.h3`
  color: #228b22;
  font-size: 22px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
`;

// Details section
const Details = styled.p`
  font-size: 16px;
  color: #555;
  margin: 5px 0;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

// Status Badge with dynamic colors
const StatusBadge = styled.span`
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  background: ${({ status }) => {
    switch (status) {
      case 'pending':
        return '#f0ad4e'; // Orange for pending (🕒)
      case 'fulfilled':
        return '#28a745'; // Green for fulfilled (✅)
      case 'partially_fulfilled':
        return '#6c757d'; // Grey for partially fulfilled (❌)
      case 'approved':
        return '#228b22'; // Green for approved (if still used elsewhere)
      case 'rejected':
        return '#dc3545'; // Red for rejected
      default:
        return '#888'; // Default grey for unknown statuses
    }
  }};
`;

// Product/Meal list
const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 10px;
`;

const Item = styled.li`
  background: #f5f5f5;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 14px;
  color: #333;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// Button to view more details
const SeeMoreButton = styled(Link)`
  display: inline-block;
  padding: 10px 16px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  border-radius: 30px;
  background: #228b22;
  color: white;
  text-decoration: none;
  margin-top: 15px;
  transition: background 0.3s;

  &:hover {
    background: #1e7a1e;
  }
`;

export const Composantdonation = ({ donation }) => {
  if (!donation || typeof donation !== 'object' || !donation._id) {
    return <div>Invalid donation data.</div>;
  }

  const {
    _id,
    title,
    address,
    expirationDate,
    numberOfMeals = 0,
    products = [],
    meals = [],
    status,
  } = donation;

  // Log for debugging
 // console.log("Products:", products);
  ///console.log("Meals:", meals);

  return (
    <Card>
      <div>
        <Title>🛒 {title || 'Untitled Donation'}</Title>
        <Details>📍 <strong>Location:</strong> {address || 'Not specified'}</Details>
        <Details>
          📆 <strong>Expiration:</strong>{' '}
          {expirationDate ? new Date(expirationDate).toLocaleDateString() : 'Not defined'}
        </Details>
        <Details>
          🔄 <strong>Status:</strong>{' '}
          <StatusBadge status={status}>{status || 'Unknown'}</StatusBadge>
        </Details>

        {/* Conditional display of products or meals */}
        {Array.isArray(products) && products.length > 0 ? (
          <>
            <h4>📦 Available Products:</h4>
            <ItemList>
              {products.slice(0, 2).map((product, index) => (
                <Item key={index}>
                  {product.product && typeof product.product === 'object' ? (
                    <>
                      <span><strong>Name:</strong> {product.product.name || 'N/A'}</span>
                      <span><strong>Type:</strong> {product.product.productType || 'N/A'}</span>
                      <span>
                        <strong>Weight:</strong>{' '}
                        {product.product.weightPerUnit
                          ? `${product.product.weightPerUnit} ${product.product.weightUnit || ''}`
                          : 'N/A'}
                      </span>
                      <span><strong>Status:</strong> {product.product.status || 'N/A'}</span>
                      <span><strong>Quantity:</strong> {product.quantity || 0}</span>
                    </>
                  ) : (
                    <span>No product data available</span>
                  )}
                </Item>
              ))}
              {products.length === 0 && <Item>No products available</Item>}
            </ItemList>
          </>
        ) : Array.isArray(meals) && meals.length > 0 ? (
          <>
            <h4>🍽️ Available Meals:</h4>
            <Details><strong>Total Quantity:</strong> {numberOfMeals}</Details>
            <ItemList>
              {meals.slice(0, 2).map((meale, index) => (
                <Item key={index}>
                  {meale.meal && typeof meale.meal === 'object' ? (
                    <>
                      <span><strong>Name:</strong> {meale.meal.mealName || 'Not specified'}</span>
                      <span><strong>Description:</strong> {meale.meal.mealDescription || 'Not specified'}</span>
                      <span><strong>Type:</strong> {meale.meal.mealType || 'Not specified'}</span>
                      <span><strong>Quantity:</strong> {meale.quantity || 0}</span>
                    </>
                  ) : (
                    <span>Invalid meal data</span>
                  )}
                </Item>
              ))}
              {meals.length === 0 && <Item>No meals available</Item>}
            </ItemList>
          </>
        ) : (
          <Item>No products or meals available</Item>
        )}
      </div>

      <SeeMoreButton to={`/DetailsDonations/${_id}`}>See More</SeeMoreButton>
    </Card>
  );
};

export default Composantdonation;