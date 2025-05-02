"use client"

import { useEffect, useState } from "react"
import styled, { createGlobalStyle, keyframes, css } from "styled-components"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import donation1 from "../assets/images/home1.png"
import donation2 from "../assets/images/home2.png"
import donation3 from "../assets/images/home3.png"
import { useAuth } from "../contexts/AuthContext"
import patternBg from "../assets/images/bg.png"

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: #f0f8f0;
    box-sizing: border-box;
    overflow-x: hidden;
  }
`

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const fadeSlide = keyframes`
  0% { opacity: 0; transform: scale(1.05); }
  8% { opacity: 1; transform: scale(1); }
  33% { opacity: 1; transform: scale(1); }
  41% { opacity: 0; transform: scale(1.05); }
  100% { opacity: 0; transform: scale(1.05); }
`

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;
  
  & > section {
    opacity: 0;
    animation: ${fadeIn} 0.8s ease-out forwards;
  }
  
  & > section:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  & > section:nth-child(3) {
    animation-delay: 0.4s;
  }
  & > section:nth-child(4) {
    animation-delay: 0.6s;
  }
  & > section:nth-child(5) {
    animation-delay: 0.8s;
  }
`

const HeroSection = styled.section`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 80px 80px 120px;
  gap: 40px;
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
`

const HeroText = styled.div`
  flex: 1 1 500px;
  z-index: 2;
  
  h1 {
    font-size: 52px;
    font-weight: 800;
    color: #1a7a1a;
    margin-bottom: 20px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, #228b22, #56ab2f);
      border-radius: 2px;
    }
  }
  
  p {
    font-size: 20px;
    color: #3a5a3a;
    margin-bottom: 35px;
    line-height: 1.6;
    max-width: 90%;
  }
`

const CallToAction = styled.a`
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
`

const SliderContainer = styled.div`
  position: relative;
  flex: 1 1 500px;
  width: 100%;
  height: 420px;
  overflow: hidden;
  z-index: 2;
  transform-style: preserve-3d;
  perspective: 1000px;
  animation: ${float} 6s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 3px;
    mask-composite: exclude;
    z-index: 3;
    pointer-events: none;
  }
`

const SlideImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  opacity: 0;
  animation: ${fadeSlide} 12s infinite;
  animation-fill-mode: forwards;
  filter: brightness(1.05) contrast(1.05);
`

const Slide1 = styled(SlideImage)`
  animation-delay: 0s;
`
const Slide2 = styled(SlideImage)`
  animation-delay: 4s;
`
const Slide3 = styled(SlideImage)`
  animation-delay: 8s;
`

const Wave = styled.svg`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
  z-index: 1;
  filter: drop-shadow(0 -5px 5px rgba(0, 0, 0, 0.03));
`

const SectionWrapper = styled.section`
  padding: 80px;
  background: ${(props) => props.bgColor || "#fff"};
  text-align: ${(props) => props.align || "center"};
  position: relative;
  overflow: hidden;
  
  ${(props) =>
    props.bgColor &&
    css`
    &::before {
      content: '';
      position: absolute;
      top: -100px;
      right: -100px;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: rgba(34, 139, 34, 0.05);
      z-index: 0;
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: -80px;
      left: -80px;
      width: 250px;
      height: 250px;
      border-radius: 50%;
      background: rgba(34, 139, 34, 0.05);
      z-index: 0;
    }
  `}
`

const SectionTitle = styled.h2`
  font-size: 40px;
  font-weight: 700;
  color: #1a7a1a;
  margin-bottom: 50px;
  position: relative;
  display: inline-block;
  z-index: 1;
   
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
  
  ${(props) =>
    props.align === "left" &&
    css`
    &::after {
      left: 0;
      transform: none;
    }
  `}
`

const FeaturesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
  position: relative;
  z-index: 1;
`

const FeatureCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 30px;
  flex: 1 1 250px;
  max-width: 300px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(34, 139, 34, 0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 0;
    background: linear-gradient(to bottom, #228b22, #56ab2f);
    transition: height 0.3s ease;
  }
  
  &:hover::before {
    height: 100%;
  }
  
  h3 {
    font-size: 24px;
    font-weight: 600;
    color: #1a7a1a;
    margin-bottom: 15px;
    transition: color 0.3s ease;
  }
  
  p {
    font-size: 16px;
    color: #3a5a3a;
    line-height: 1.6;
    transition: color 0.3s ease;
  }
`

const ProposedSolutionList = styled.ul`
  list-style: none;
  margin-left: 10px;
  font-size: 18px;
  color: #3a5a3a;
  position: relative;
  z-index: 1;
  
  li {
    margin-bottom: 20px;
    line-height: 1.6;
    position: relative;
    padding-left: 35px;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateX(5px);
    }
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #228b22, #56ab2f);
      border-radius: 50%;
      opacity: 0.2;
    }
    
    &::after {
      content: '✓';
      position: absolute;
      left: 6px;
      top: 4px;
      color: #228b22;
      font-weight: bold;
    }
    
    strong {
      color: #1a7a1a;
      font-weight: 600;
    }
  }
`

const SummaryText = styled.p`
  font-size: 18px;
  color: #3a5a3a;
  margin-top: 30px;
  line-height: 1.7;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  border-left: 4px solid #228b22;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
`

const AdvertisementSection = styled.section`
  padding: 60px 80px;
  background: linear-gradient(to bottom, #fff, #f9fdf9);
  text-align: center;
  position: relative;
  z-index: 1;
  border-radius: 20px;
  margin: 0 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.03);
  
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    right: 20px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(34, 139, 34, 0.05);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 20px;
    left: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(34, 139, 34, 0.05);
    z-index: 0;
  }
`

const TopTransporterSection = styled.section`
  padding: 60px 80px;
  background: linear-gradient(to bottom, #fff, #f9fdf9);
  text-align: center;
  position: relative;
  z-index: 1;
  border-radius: 20px;
  margin: 0 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.03);
  
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    right: 20px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(34, 139, 34, 0.05);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 20px;
    left: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(34, 139, 34, 0.05);
    z-index: 0;
  }
`

const AdImage = styled.img`
  width: 100%;
  max-width: 600px;
  height: 300px;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  object-fit: cover;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px) scale(1.01);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`

const TransporterImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #228b22;
  box-shadow: 0 8px 20px rgba(34, 139, 34, 0.2);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`

const SponsorText = styled.p`
  margin-top: 25px;
  font-size: 18px;
  color: #2a4a2a;
  font-weight: 500;
  padding: 12px 24px;
  background: rgba(34, 139, 34, 0.05);
  border-radius: 30px;
  display: inline-block;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(34, 139, 34, 0.08);
    transform: translateY(-2px);
  }
`

const TransporterInfo = styled.div`
  margin-top: 20px;
  font-size: 20px;
  color: #1a7a1a;
  font-weight: 600;
`

const ThankYouMessage = styled.p`
  margin-top: 15px;
  font-size: 16px;
  color: #3a5a3a;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`

const CarouselContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  position: relative;
`

const ChevronButton = styled.button`
  padding: 10px;
  background: linear-gradient(135deg, #228b22, #56ab2f);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(34, 139, 34, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(34, 139, 34, 0.3);
    background: linear-gradient(135deg, #1a7a1a, #4a9a27);
  }
`

const ErrorMessage = styled.p`
  font-size: 18px;
  color: #d32f2f;
  margin-top: 20px;
  padding: 10px 20px;
  background: rgba(211, 47, 47, 0.05);
  border-radius: 8px;
`

const Home = () => {
  const { user: authUser, token } = useAuth()
  const [advertisements, setAdvertisements] = useState([])
  const [topTransporter, setTopTransporter] = useState(null)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [adError, setAdError] = useState("")
  const [transporterError, setTransporterError] = useState("")

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/top-donor-ad", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (response.ok) {
          setAdvertisements(data)
          setAdError("")
        } else {
          setAdError(data.error || "Failed to fetch advertisements")
        }
      } catch (error) {
        console.error("Error fetching advertisements:", error)
        setAdError("Failed to fetch advertisements")
      }
    }
    fetchAdvertisements()
  }, [token])

  useEffect(() => {
    const fetchTopTransporter = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/top-transporter", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (response.ok) {
          setTopTransporter(data)
          setTransporterError("")
        } else {
          setTransporterError(data.error || "Failed to fetch top transporter")
        }
      } catch (error) {
        console.error("Error fetching top transporter:", error)
        setTransporterError("Failed to fetch top transporter")
      }
    }
    fetchTopTransporter()
  }, [token])

  useEffect(() => {
    const sections = document.querySelectorAll("section")
    const revealSection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1"
        }
      })
    }
    const sectionObserver = new IntersectionObserver(revealSection, {
      root: null,
      threshold: 0.15,
    })
    sections.forEach((section) => {
      sectionObserver.observe(section)
    })
    return () => {
      sections.forEach((section) => {
        sectionObserver.unobserve(section)
      })
    }
  }, [])

  useEffect(() => {
    if (advertisements.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) =>
          prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
        )
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [advertisements])

  const handleNextAd = () => {
    setCurrentAdIndex((prevIndex) =>
      prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
    )
  }

  const getRankText = (index) => {
    switch (index) {
      case 0:
        return "1st Donor"
      case 1:
        return "2nd Donor"
      case 2:
        return "3rd Donor"
      default:
        return "Donor"
    }
  }

  return (
    <>
      <GlobalStyle />
      <Navbar />
      <HomeContainer>
        <HeroSection>
          <HeroText>
            <h1>Welcome to SustainaFood</h1>
            <p>
              Connecting donors, recipients, and transporters to reduce food waste and bring help where it's needed
              most.
            </p>
            {!authUser && <CallToAction href="/signup">Join Us Today</CallToAction>}
          </HeroText>
          <SliderContainer>
            <Slide1 src={donation2} alt="Donation 1" />
            <Slide2 src={donation3} alt="Donation 2" />
            <Slide3 src={donation1} alt="Donation 3" />
          </SliderContainer>
          <Wave viewBox="0 0 1440 320">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,96L30,90C60,85,120,75,180,64C240,53,300,43,360,64C420,85,480,139,540,170.7C600,203,660,213,720,224C780,235,840,245,900,240C960,235,1020,213,1080,181.3C1140,149,1200,107,1260,112C1320,117,1380,171,1410,197.3L1440,224L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
            />
          </Wave>
        </HeroSection>
        <AdvertisementSection>
          <SectionTitle>Top Donors' Advertisements</SectionTitle>
          {adError ? (
            <ErrorMessage>{adError}</ErrorMessage>
          ) : advertisements.length > 0 ? (
            <CarouselContainer>
              <AdImage
                src={`http://localhost:3000/${advertisements[currentAdIndex].advertisementImage}`}
                alt={`Advertisement by ${advertisements[currentAdIndex].name}`}
              />
              <SponsorText>
                Sponsored by {advertisements[currentAdIndex].name}, our {getRankText(currentAdIndex)}!
              </SponsorText>
              {advertisements.length > 1 && (
                <ChevronButton onClick={handleNextAd}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </ChevronButton>
              )}
            </CarouselContainer>
          ) : (
            <SponsorText>No advertisements available</SponsorText>
          )}
        </AdvertisementSection>
        <TopTransporterSection>
          <SectionTitle>Our Top Transporter</SectionTitle>
          {transporterError ? (
            <ErrorMessage>{transporterError}</ErrorMessage>
          ) : topTransporter ? (
            <CarouselContainer>
              <TransporterImage
                src={`http://localhost:3000/${topTransporter.photo}`} // Changed from profilePicture to photo
                alt={`Profile picture of ${topTransporter.name}`}
              />
              <TransporterInfo>
                {topTransporter.name} - {topTransporter.deliveryCount} Deliveries
              </TransporterInfo>
              <ThankYouMessage>
                Thank you, {topTransporter.name}, for your dedication in delivering food to those in need. Your efforts
                help reduce waste and strengthen our community!
              </ThankYouMessage>
            </CarouselContainer>
          ) : (
            <SponsorText>No top transporter data available</SponsorText>
          )}
        </TopTransporterSection>
        <SectionWrapper>
          <SectionTitle>Our Key Features</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <h3>User Management</h3>
              <p>Seamlessly register, authenticate, and manage your profile with our intuitive interface.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Food Donation Management</h3>
              <p>Donate, track, and manage food donations easily with real-time updates and notifications.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Logistics & AI Routing</h3>
              <p>Efficiently schedule and optimize deliveries with our advanced AI algorithms for minimal waste.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Notifications & Feedback</h3>
              <p>Stay updated with real-time notifications and provide valuable feedback to improve our services.</p>
            </FeatureCard>
          </FeaturesGrid>
        </SectionWrapper>
        <SectionWrapper bgColor="#e8f5e9" align="left">
          <SectionTitle align="left">Our Proposed Solution</SectionTitle>
          <ProposedSolutionList>
            <li>
              <strong>Real-time Analytics:</strong> Track the impact of actions and adjust strategies as needed with
              comprehensive dashboards and reports.
            </li>
            <li>
              <strong>Free Services for All Stakeholders:</strong> Completely free services for NGOs, partner companies,
              and other stakeholders to maximize participation.
            </li>
            <li>
              <strong>Artificial Intelligence:</strong> Optimize routes and stock management to reduce logistics costs
              and improve efficiency with cutting-edge AI technology.
            </li>
            <li>
              <strong>Gamification:</strong> Reward both consumers and merchants to encourage active participation
              through points, badges, and recognition.
            </li>
            <li>
              <strong>Awareness Campaign:</strong> Collaborate with local associations to expand the partner network and
              maximize national impact through targeted outreach.
            </li>
          </ProposedSolutionList>
          <SummaryText>
            In summary, SustainaFood offers a flexible, intelligent, and scalable solution to effectively combat food
            waste in Tunisia while building a stronger, more connected community.
          </SummaryText>
        </SectionWrapper>
      </HomeContainer>
      <Footer />
    </>
  )
}

export default Home