import React, { useEffect, useState } from 'react';
import { getRequestsByRecipientId } from "../api/requestNeedsService";
import { useAuth } from "../contexts/AuthContext";
import Composantrequest from "../components/Composantrequest";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styled, { createGlobalStyle } from 'styled-components';
import { FaSearch, FaFilter } from "react-icons/fa"; // Importing Icons

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: #f0f8f0;
    box-sizing: border-box;
  }
`;

const Container = styled.div`
  padding: 40px 60px;
  text-align: center;
`;

const Title = styled.h1`
  color: #228b22;
  font-size: 40px;
  margin-bottom: 20px;
`;

// 🎨 Styled Search Box
const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 8px;
  border-radius: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 320px;
  margin: auto;
  transition: all 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #555;
  margin-right: 8px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 16px;
  width: 100%;
  padding: 8px;
  background: transparent;
`;

// 🎯 Stylish Filters & Sorting
const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
`;

const FilterIcon = styled(FaFilter)`
  margin-right: 8px;
`;

const Select = styled.select`
  padding: 10px;
  font-size: 16px;
  border-radius: 25px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: 0.3s;
  cursor: pointer;
  background: white;
  color: #333;
  font-weight: bold;

  &:hover {
    border-color: #228b22;
    transform: scale(1.05);
  }
`;

const ContentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
`;

const LoadingMessage = styled.div`
  font-size: 18px;
  color: #555;
`;

const NoRequests = styled.p`
  font-size: 18px;
  color: #888;
`;

export default function MyRequest() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: authUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("date");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchRequests = async () => {
      if (!authUser || !authUser._id) {
        setLoading(false);
        return;
      }

      try {
        const response = await getRequestsByRecipientId(authUser._id);
        setRequests(response.data);
        setFilteredRequests(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Backend error:", error);
        setLoading(false);
      }
    };

    fetchRequests();
  }, [authUser]);

  // 🔍 Search, Sort, & Filter Logic
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
        return a.status.localeCompare(b.status);
      } else {
        return new Date(a.expirationDate) - new Date(b.expirationDate);
      }
    });

    setFilteredRequests(updatedRequests);
  }, [searchQuery, sortOption, statusFilter, categoryFilter, requests]);

  return (
    <>
      <GlobalStyle />
      <Navbar />
      <Container>
        <Title>My Requests</Title>

        {/* 🔍 Stylish Search Bar */}
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        {/* 🎯 Advanced Filters & Sorting */}
        <Controls>
          <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="date">📆 Sort by Expiration Date</option>
            <option value="title">🔠 Sort by Title</option>
            <option value="status">🔄 Sort by Status</option>
          </Select>

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">🟢 All Statuses</option>
            <option value="Pending">🕒 Pending</option>
            <option value="Accepted">✅ Accepted</option>
            <option value="Rejected">❌ Rejected</option>
          </Select>

          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">📦 All Categories</option>
            <option value="prepared_meals">🍽️ Prepared Meals</option>
            <option value="groceries">🛒 Groceries</option>
            <option value="hygiene">🧼 Hygiene</option>
          </Select>
        </Controls>

        {/* 🔄 Display Requests */}
        <ContentList>
          {loading ? (
            <LoadingMessage>Loading...</LoadingMessage>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((requestItem) => (
              <Composantrequest key={requestItem._id} request={requestItem} />
            ))
          ) : (
            <NoRequests>No matching requests found.</NoRequests>
          )}
        </ContentList>
      </Container>
      <Footer />
    </>
  );
}
