import React, { useEffect, useState } from 'react';
import { getRequestsByRecipientId } from "../api/requestNeedsService";
import { useAuth } from "../contexts/AuthContext";
import Composantrequest from "../components/Composantrequest";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styled, { createGlobalStyle } from 'styled-components';
import { FaSearch, FaFilter } from "react-icons/fa";

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

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;

  button {
    padding: 10px 20px;
    font-size: 16px;
    background: #228b22;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #56ab2f;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  span {
    font-size: 16px;
    color: #333;
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
    // In MyRequest.js
const fetchRequests = async () => {
  // Get the user ID - try different possible properties
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

    // Apply filters
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

    // Apply sorting
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
    setCurrentPage(1);
  }, [searchQuery, sortOption, statusFilter, categoryFilter, requests]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
 <>      
      <Navbar />
      <Container>
        <Title>My Requests</Title>

        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

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
          </PaginationControls>)}
        </Container>
      <Footer />
      </>
    );
}