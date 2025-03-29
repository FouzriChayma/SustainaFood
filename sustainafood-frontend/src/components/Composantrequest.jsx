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
                return 'orange';
            case 'approved':
                return '#228b22';
            case 'rejected':
                return 'red';
            default:
                return '#888';
        }
    }};
`;

// Product list
const ProductList = styled.ul`
    list-style: none;
    padding: 0;
    margin-top: 10px;
`;

const ProductItem = styled.li`
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

export const Composantrequest = ({ request }) => {
  if (!request || typeof request !== 'object' || !request._id) {
    return <div>Invalid request data.</div>;
  }

  const {
    _id,
    title,
    location,
    expirationDate,
    description,
    category,
    status,
    requestedProducts,
    numberOfMeals,
    mealName, // New attribute
    mealDescription, // New attribute
    mealType, // New attribute
  } = request;

  return (
    <Card>
      <div>
        <Title>🛒 {title || 'Untitled Request'}</Title>
        <Details>📍 <strong>Location:</strong> {location || 'Not specified'}</Details>
        <Details>📆 <strong>Expiration:</strong> {expirationDate ? new Date(expirationDate).toLocaleDateString() : 'Not defined'}</Details>
        <Details>📝 <strong>Description:</strong> {description || 'No description'}</Details>
        <Details>📂 <strong>Category:</strong> {category || 'Not specified'}</Details>
        <Details>🔄 <strong>Status:</strong> <StatusBadge status={status}>{status || 'Unknown'}</StatusBadge></Details>

        {/* Conditional Rendering of Products or Meal Details */}
        <h4>{category === 'prepared_meals' ? '🍽️ Prepared Meals' : '📦 Requested Products:'}</h4>
        <ProductList>
          {category === 'prepared_meals' ? (
            <>
              {mealName || mealDescription || mealType ? (
                <ProductItem>
                  {mealName && (
                    <span>
                      <strong>Meal Name:</strong> {mealName}
                    </span>
                  )}
                  {mealDescription && (
                    <span>
                      <strong>Description:</strong> {mealDescription}
                    </span>
                  )}
                  {mealType && (
                    <span>
                      <strong>Type:</strong> {mealType}
                    </span>
                  )}
                  <span>
                    <strong>Number of Meals:</strong> {numberOfMeals || 'Not specified'}
                  </span>
                </ProductItem>
              ) : (
                <ProductItem>
                  <span>
                    <strong>Number of Meals:</strong> {numberOfMeals || 'Not specified'}
                  </span>
                </ProductItem>
              )}
            </>
          ) : requestedProducts && requestedProducts.length > 0 ? (
            requestedProducts.map((item, index) => (
              <ProductItem key={index}>
                <span>
                  <strong>Type:</strong> {item.product?.productType || 'Not specified'}
                </span>
                <span>
                  <strong>Weight:</strong> {item.product?.weightPerUnit || 0} {item.product?.weightUnit || ''}
                </span>
                <span>
                  <strong>Quantity:</strong> {item.quantity || 0} {item.product?.weightUnitTotale || ''}
                </span>
                <span>
                  <strong>Status:</strong> {item.product?.status || 'Unknown'}
                </span>
              </ProductItem>
            ))
          ) : (
            <ProductItem>No requested products</ProductItem>
          )}
        </ProductList>
      </div>

      {/* Button to view more details */}
      <SeeMoreButton to={`/DetailsRequest/${_id}`}>See more</SeeMoreButton>
    </Card>
  );
};

export default Composantrequest;