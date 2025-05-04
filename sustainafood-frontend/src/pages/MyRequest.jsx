"use client"

import React, { useEffect, useState } from 'react';
import { getRequestsByRecipientId } from "../api/requestNeedsService";
import { useAuth } from "../contexts/AuthContext";
import Composantrequest from "../components/Composantrequest";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { FaSearch, FaFilter } from "react-icons/fa";
import { Link } from 'react-router-dom';

// Replace with the actual path to your background pattern image
import patternBg from "../assets/images/bg.png";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: #f0f8f0;
    box-sizing: border-box;
    overflow-x: hidden;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const RequestsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;

  & > section {
    opacity: 0;
    animation: ${fadeIn} 0.8s ease-out forwards;
  }
`;

const RequestsSection = styled.section`
  position: relative;
  padding: 80px 80px 120px;
  background: 
    linear-gradient(135deg, rgba(230, 242, 230, 0.9), rgba(220, 240, 220, 0.85)),
    url(${patternBg}) repeat center center;
  background-size: 200px 200px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(34, 139, 34, 0.1);
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: 15%;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(34, 139, 34, 0.08);
    z-index: 1;
  }
`;

const SectionTitle = styled.h2`
  font-size: 40px;
  font-weight: 700;
  color: #1a7a1a;
  margin-bottom: 50px;
  position: relative;
  text-align: center;
  z-index: 2;

  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #228b22, #56ab2f);
    border-radius: 2px;
  }
`;

const TopControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  z-index: 2;
`;

const AddRequestButton = styled(Link)`
  display: inline-block;
  padding: 16px 36px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #228b22, #56ab2f);
  color: white;
  border-radius: 30px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 6px 15px rgba(34, 139, 34, 0.2);
  position: relative;
  overflow: hidden;
  animation: ${float} 6s ease-in-out infinite;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(34, 139, 34, 0.3);
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100%);
    transform: rotate(30deg);
    animation: ${shimmer} 3s infinite;
    pointer-events: none;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 12px 20px;
  border-radius: 30px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  width: 320px;
  transition: all 0.3s ease;
  z-index: 2;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #3a5a3a;
  margin-right: 10px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 16px;
  width: 100%;
  background: transparent;
  color: #3a5a3a;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  z-index: 2;
`;

const FilterIcon = styled(FaFilter)`
  margin-right: 8px;
  color: #3a5a3a;
`;

const Select = styled.select`
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 30px;
  border: none;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  background: white;
  color: #3a5a3a;
  font-weight: 600;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(34, 139, 34, 0.2);
  }
`;

const ContentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  z-index: 2;

  & > * {
    flex: 0 0 calc(33.333% - 20px); /* Fixed 3 cards per row */
    max-width: calc(33.333% - 20px);
    box-sizing: border-box;
  }
`;

const LoadingMessage = styled.div`
  font-size: 18px;
  color: #3a5a3a;
  z-index: 2;
`;

const NoRequests = styled.p`
  font-size: 18px;
  color: #3a5a3a;
  z-index: 2;
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 15px;
  z-index: 2;

  button {
    padding: 12px 24px;
    font-size: 16px;
    background: linear-gradient(135deg, #228b22, #56ab2f);
    color: white;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 6px 15px rgba(34, 139, 34, 0.2);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(34, 139, 34, 0.3);
    }

    &:disabled {
      background: #ccc;
      box-shadow: none;
      cursor: not-allowed;
      transform: none;
    }
  }

  span {
    font-size: 16px;
    color: #3a5a3a;
  }
`;

export default function MyRequest() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: authUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("date");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    console.log("Current authUser:", authUser);
    console.log("LocalStorage user:", localStorage.getItem("user"));
    console.log("LocalStorage token:", localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      const userId = authUser?._id || authUser?.id || authUser?.user?._id;
      
      if (!userId) {
        console.log("No user ID found in authUser:", authUser);
        setError("User not properly authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getRequestsByRecipientId(userId);
        setRequests(response.data);
        setFilteredRequests(response.data);
      } catch (error) {
        setError("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [authUser]);

  useEffect(() => {
    let updatedRequests = [...requests];

    if (searchQuery) {
      updatedRequests = updatedRequests.filter((request) =>
        request.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      updatedRequests = updatedRequests.filter((request) => request.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      updatedRequests = updatedRequests.filter((request) => request.category === categoryFilter);
    }

    updatedRequests.sort((a, b) => {
      if (sortOption === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortOption === "status") {
        return a.status.localeCompare(b.title);
      } else {
        return new Date(a.expirationDate) - new Date(b.expirationDate);
      }
    });

    setFilteredRequests(updatedRequests);
    setCurrentPage(1);
  }, [searchQuery, sortOption, statusFilter, categoryFilter, requests]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <>
      <GlobalStyle />
      <Navbar />
      <RequestsContainer>
        <RequestsSection>
          <SectionTitle>My Requests</SectionTitle>
          {error && <div style={{ color: 'red', textAlign: 'center', zIndex: 2 }}>{error}</div>}
          <TopControls>
            <AddRequestButton to="/AddDonation">
              ✚ Add New Request
            </AddRequestButton>
            <SearchContainer>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchContainer>
          </TopControls>
          <Controls>
            <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="date">📆 Sort by Expiration Date</option>
              <option value="title">🔠 Sort by Title</option>
              <option value="status">🔄 Sort by Status</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">🟢 All Statuses</option>
              <option value="pending">🕒 Pending</option>
              <option value="approved">✅ Accepted</option>
              <option value="rejected">❌ Rejected</option>
            </Select>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">📦 All Categories</option>
              <option value="prepared_meals">🍽️ Prepared Meals</option>
              <option value="packaged_products">🛒 Packaged Products</option>
            </Select>
          </Controls>
          <ContentList>
            {loading ? (
              <LoadingMessage>Loading your requests...</LoadingMessage>
            ) : currentRequests.length > 0 ? (
              currentRequests.map((requestItem) => (
                <Composantrequest key={requestItem._id} request={requestItem} />
              ))
            ) : (
              <NoRequests>No requests found. Create your first request!</NoRequests>
            )}
          </ContentList>
          {filteredRequests.length > itemsPerPage && (
            <PaginationControls>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </PaginationControls>
          )}
        </RequestsSection>
      </RequestsContainer>
      <Footer />
    </>
  );
}