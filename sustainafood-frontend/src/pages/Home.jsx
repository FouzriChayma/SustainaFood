// Home.jsx
import React from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import donation1 from '../assets/images/donation1.jpg';
import donation2 from '../assets/images/donation2.jpg';
import donation3 from '../assets/images/donation3.jpg';
import { useAuth } from "../contexts/AuthContext";

// Replace this with the actual path to your background pattern image:
import patternBg from '../assets/images/bg.png';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: #f0f8f0;
    box-sizing: border-box;
  }
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
  gap: 60px;
`;

/* ===== HERO SECTION ===== */
const HeroSection = styled.section`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 60px 80px;
  gap: 30px;

  /* 
    1) We set the pattern image to repeat. 
    2) We apply a semi-transparent overlay for readability.
    3) You can adjust background-size depending on your pattern's scale.
  */
  background: 
    linear-gradient(rgba(230, 242, 230, 0.85), rgba(230, 242, 230, 0.85)),
    url(${patternBg}) repeat center center;
  background-size: 200px 200px; 
  overflow: hidden; /* So the wave is contained properly */
`;

const HeroText = styled.div`
  flex: 1 1 500px;
  z-index: 2; /* Make sure text stays above the wave */
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
  flex: 1 1 500px;
  width: 100%;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  z-index: 2; /* Above the wave shape */
`;

const SlideImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
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
  animation-delay: 4s;
`;
const Slide3 = styled(SlideImage)`
  animation-delay: 8s;
`;

/* ===== WAVE SHAPE ===== */
const Wave = styled.svg`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
  z-index: 1; /* Behind text and slider, but above background */
`;

/* ===== FEATURES SECTION ===== */
const SectionWrapper = styled.section`
  padding: 60px 80px;
  background: ${props => props.bgColor || '#fff'};
  text-align: ${props => props.align || 'center'};
`;

const SectionTitle = styled.h2`
  font-size: 36px;
  color: #228b22;
  margin-bottom: 40px;
`;

const FeaturesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
`;

const FeatureCard = styled.div`
  background: #f9fff9;
  border-radius: 15px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px;
  padding: 20px;
  flex: 1 1 250px;
  max-width: 300px;
  h3 {
    font-size: 24px;
    color: #228b22;
    margin-bottom: 10px;
  }
  p {
    font-size: 16px;
    color: #555;
    line-height: 1.4;
  }
`;

/* ===== PROPOSED SOLUTION SECTION ===== */
const ProposedSolutionList = styled.ul`
  list-style: disc;
  margin-left: 40px;
  font-size: 18px;
  color: #555;
  li {
    margin-bottom: 10px;
    line-height: 1.6;
  }
`;

const Home = () => {
  const { user: authUser, token, logout } = useAuth();

  return (
    <>
      <GlobalStyle />
      <Navbar />
      <HomeContainer>
        {/* Hero Section */}
        <HeroSection>
          <HeroText>
            <h1>Welcome to SustainaFood</h1>
            <p>
              Connecting donors, recipients, and transporters to reduce food waste and bring help where it's needed.
            </p>
            {!authUser && <CallToAction href="/signup">Join Us Today</CallToAction>}
          </HeroText>
          <SliderContainer>
            <Slide1 src={donation1} alt="Donation 1" />
            <Slide2 src={donation2} alt="Donation 2" />
            <Slide3 src={donation3} alt="Donation 3" />
          </SliderContainer>

          {/* Decorative Wave at the bottom of Hero */}
          <Wave viewBox="0 0 1440 320">
            <path
              fill="#f0f8f0"
              fillOpacity="1"
              d="M0,96L30,90C60,85,120,75,180,64C240,53,300,43,360,64C420,85,480,139,540,170.7C600,203,660,213,720,224C780,235,840,245,900,240C960,235,1020,213,1080,181.3C1140,149,1200,107,1260,112C1320,117,1380,171,1410,197.3L1440,224L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
            />
          </Wave>
        </HeroSection>

        {/* Features Section */}
        <SectionWrapper>
          <SectionTitle>Our Key Features</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <h3>User Management</h3>
              <p>Seamlessly register, authenticate, and manage your profile.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Food Donation Management</h3>
              <p>Donate, track, and manage food donations easily.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Logistics & AI Routing</h3>
              <p>Efficiently schedule and optimize deliveries with AI.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Notifications & Feedback</h3>
              <p>Stay updated with real-time notifications and provide feedback.</p>
            </FeatureCard>
          </FeaturesGrid>
        </SectionWrapper>

        {/* Proposed Solution Section */}
        <SectionWrapper bgColor="#e8f5e9" align="left">
          <SectionTitle>Our Proposed Solution</SectionTitle>
          <ProposedSolutionList>
            <li>
              <strong>Real-time Analytics:</strong> Track the impact of actions and adjust strategies as needed.
            </li>
            <li>
              <strong>Free Services for All Stakeholders:</strong> Completely free services for NGOs, partner companies, and other stakeholders.
            </li>
            <li>
              <strong>Artificial Intelligence:</strong> Optimize routes and stock management to reduce logistics costs and improve efficiency.
            </li>
            <li>
              <strong>Gamification:</strong> Reward both consumers and merchants to encourage active participation.
            </li>
            <li>
              <strong>Awareness Campaign:</strong> Collaborate with local associations to expand the partner network and maximize national impact.
            </li>
          </ProposedSolutionList>
          <p
            style={{
              fontSize: '18px',
              color: '#555',
              marginTop: '20px',
              lineHeight: '1.6'
            }}
          >
            In summary, SustainaFood offers a flexible, intelligent, and scalable solution to effectively combat food waste in Tunisia.
          </p>
        </SectionWrapper>
      </HomeContainer>
      <Footer />
    </>
  );
};

export default Home;
