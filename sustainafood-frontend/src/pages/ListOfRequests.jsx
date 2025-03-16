import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import donation1 from '../assets/images/donation1.jpg';
import donation2 from '../assets/images/donation2.jpg';
import donation3 from '../assets/images/donation3.jpg';
import donation4 from '../assets/images/donation4.png';
import donation5 from '../assets/images/fooddonation.png';
import Composantrequest from "../components/Composantrequest";
import '../assets/styles/ListOfDonations.css';
import { getrequests } from "../api/requestNeedsService";
import donation from '../assets/images/fooddonation1.png';
import patternBg from '../assets/images/bg.png';
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

const fade = keyframes`
  0% { opacity: 0; }
  8% { opacity: 1; }
  33% { opacity: 1; }
  41% { opacity: 0; }
  100% { opacity: 0; }
`;

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const HeroSection = styled.section`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 60px 80px;
  gap: 30px;
  background: 
    linear-gradient(rgba(230, 242, 230, 0.85), rgba(230, 242, 230, 0.85)),
    url(${patternBg}) repeat center center;
  background-size: 200px 200px;
  overflow: hidden;
`;

const HeroText = styled.div`
  flex: 1 1 500px;
  z-index: 2;
  h1 {
    font-size: 48px;
    color: #228b22;
    margin-bottom: 20px;
  }
  p {
    font-size: 20px;
    color: #555;
    margin-bottom: 30px;
    line-height: 1.5;
  }
`;

const CallToAction = styled.a`
  display: inline-block;
  padding: 16px 32px;
  font-size: 18px;
  background: #228b22;
  color: white;
  border-radius: 30px;
  text-decoration: none;
  transition: background 0.3s;
  &:hover {
    background: #56ab2f;
  }
`;

const SliderContainer = styled.div`
  position: relative;
  flex: 1 1 300px;
  width: 400px; /* Adjusted for better image display */
  height: 300px;
  border-radius: 20px;
  overflow: hidden;
  z-index: 2;
`;

const SlideImage = styled.img`
  position: absolute;
  top: 0;
  left: 0; /* Corrected positioning */
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: rgba(133, 189, 150, 0.3) 0px 15px 25px -5px;
  opacity: 0;
  animation: ${fade} 12s infinite;
  animation-fill-mode: forwards;
`;

const Slide1 = styled(SlideImage)`
  animation-delay: 0s;
`;
const Slide2 = styled(SlideImage)`
  animation-delay: 2.4s; /* Adjusted for smoother transitions */
`;
const Slide3 = styled(SlideImage)`
  animation-delay: 4.8s;
`;
const Slide4 = styled(SlideImage)`
  animation-delay: 7.2s;
`;
const Slide5 = styled(SlideImage)`
  animation-delay: 9.6s;
`;
const Slide = styled(SlideImage)`
  animation-delay: 12s;
`;

const Wave = styled.svg`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
  z-index: 1;
`;

const SectionWrapper = styled.section`
  padding: 60px 80px;
  background: ${props => props.bgColor || '#fff'};
  text-align: ${props => props.align || 'center'};
`;

const ListOfRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("date");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await getrequests();
        setRequests(response.data);
        setFilteredRequests(response.data); // Initialize filteredRequests
        setLoading(false);
      } catch (error) {
        console.error("Error fetching requests:", error);
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

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
      <HomeContainer>
        <HeroSection>
          <HeroText>
            <h1>List Of Requests in SustainaFood</h1>
            <p>
              Give if you can, receive if you need—together, we reduce food waste and spread hope!
            </p>
            <CallToAction href="/AddDonation">Add Your Request</CallToAction>
          </HeroText>
          <SliderContainer>
            <Slide1 src={donation1} alt="Donation 1" />
            <Slide2 src={donation2} alt="Donation 2" />
            <Slide3 src={donation3} alt="Donation 3" />
            <Slide4 src={donation4} alt="Donation 4" />
            <Slide5 src={donation5} alt="Donation 5" />
            <Slide src={donation} alt="Donation 6" />
          </SliderContainer>
          <Wave viewBox="0 0 1440 320">
            <path
              fill="#f0f8f0"
              fillOpacity="1"
              d="M0,96L30,90C60,85,120,75,180,64C240,53,300,43,360,64C420,85,480,139,540,170.7C600,203,660,213,720,224C780,235,840,245,900,240C960,235,1020,213,1080,181.3C1140,149,1200,107,1260,112C1320,117,1380,171,1410,197.3L1440,224L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
            />
          </Wave>
        </HeroSection>
        <SectionWrapper>
          <Container>
            <Title>List Of Requests</Title>
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
                <option value="packaged_products">🛒 packaged products</option>
              </Select>
            </Controls>
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
        </SectionWrapper>
      </HomeContainer>
      <Footer />
    </>
  );
};

export default ListOfRequests;