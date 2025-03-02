// Home.jsx
import React from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import donation1 from '../assets/images/donation1.jpg';
import donation2 from '../assets/images/donation2.jpg';
import donation3 from '../assets/images/donation3.jpg';
import donation4 from '../assets/images/donation4.png';
import donation5 from '../assets/images/fooddonation.png';
import Composantdonation from '../components/Composantdonation';
import '../assets/styles/ListOfDonations.css'

import donation from '../assets/images/fooddonation1.png'

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
  gap: 0px;
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
  flex: 1 1 300px;
  width: 70px;
  height: 300px;
  border-radius: 20px;
  overflow: hidden;
  z-index: 2; /* Above the wave shape */
`;

const SlideImage = styled.img`
  position: absolute;
  top: 0;
  left: 100px;
  width: 400px;
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
const Slide4 = styled(SlideImage)`
  animation-delay: 12s;
`;
const Slide5 = styled(SlideImage)`
  animation-delay: 16s;
`;
const Slide = styled(SlideImage)`
  animation-delay: 20s;
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

const ListOfDonations = () => {
  return (
    <>
      <GlobalStyle />
      <Navbar />
      <HomeContainer>
        {/* Hero Section */}
        <HeroSection>
          <HeroText>
            <h1> List Of Donations in SustainaFood</h1>
            <p>
            Give if you can, receive if you need—together, we reduce food waste and spread hope!            </p>
            <CallToAction href="/AddDonation">Add Your Donation</CallToAction>
          </HeroText>
          <SliderContainer>
            <Slide1 src={donation1} alt="Donation 1" />
            <Slide2 src={donation2} alt="Donation 2" />
            <Slide3 src={donation3} alt="Donation 3" />
            <Slide4 src={donation4} alt="Donation 4" />
            <Slide5 src={donation5} alt="Donation 5" />
            <Slide src={donation} alt="Donation 6" />

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
        <div className="container-listdonation">
            <header>
                 <div className="profile-headerLIST">
                    <h1 style={{ color: '#228b22' , fontSize: '40px'}}>List Of Donations</h1>
                    <div className="date-switcher">
      <div className="groupsearch">
        <svg className="iconsearch" aria-hidden="true" viewBox="0 0 24 24">
          <g>
            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
          </g>
        </svg>
        <input placeholder="Search" type="search" className="inputsearch" />
      </div>
                     </div>
                 </div>
            </header>
            <div className='contentlist'>
                <div style={{marginBottom:"40px"}}>
                   {/*  Affichage personnalisé en fonction du rôle */}
                    <Composantdonation   />   
                 </div>
                 {/*<div>
                      Affichage personnalisé en fonction du rôle 
                     <Composantdonation   />   
                </div>*/}
                  {/*<div >
                      Affichage personnalisé en fonction du rôle 
                       <Composantdonation   />   
                </div>*/}
                <div >
                      {/* Affichage personnalisé en fonction du rôle */}
                       <Composantdonation   />   
                </div>
             </div>
           </div>
        </SectionWrapper>

       
      </HomeContainer>
      <Footer />
    </>
  );
};

export default ListOfDonations;
