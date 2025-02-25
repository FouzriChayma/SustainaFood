import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Add this import for the Link component
import styled from 'styled-components';
import logo from '../assets/images/logooo.png';
import imgmouna from '../assets/images/imgmouna.png';
import notif from '../assets/images/notif (2).png';
import { FaSignOutAlt,FaSignInAlt,FaBell } from 'react-icons/fa';

const NavbarContainer = styled.nav`
  background: white;
  padding: 0.6rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Logo = styled.img`
  height: 60px;
`;

const Title = styled.h1`
    color:#8dc73f;
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.ul`
  list-style: none;
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  text-decoration: none !important;
  color: black;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    color: #8dc73f;
    font-weight: bold;
  }
`;



const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  
`;

const DropdownContent = styled.div`
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 160px;
  z-index: 1;
  border-radius: 5px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
`;

const DropdownToggle = styled(NavLink)`
  cursor: pointer;
  &:hover {
    color: #000;
  }
`;
const SocialIcons = styled.div`
  display: flex;
  gap: 15px;
  margin-left: -40px;  /* Correction ici */
    margin-right: 15px;  /* Correction ici */

  svg {
    color: black;
    font-size: 20px;
    cursor: pointer;
    transition: transform 0.3s, color 0.3s;
    
    &:hover {
      transform: scale(1.2);
      color: #8dc73f;
    }
  }
`;



const Dropdown = ({ label, items }) => {
  return (
    <DropdownContainer
      onMouseEnter={(e) => {
        const dropdownContent = e.currentTarget.querySelector('.dropdown-content');
        if (dropdownContent) dropdownContent.style.display = 'block';
      }}
      onMouseLeave={(e) => {
        const dropdownContent = e.currentTarget.querySelector('.dropdown-content');
        if (dropdownContent) dropdownContent.style.display = 'none';
      }}
    >
      <DropdownToggle>{label}</DropdownToggle>
      <DropdownContent className="dropdown-content">
        {items.map((item, index) => (
          <NavLink key={index}>{item}</NavLink>
        ))}
      </DropdownContent>
    </DropdownContainer>
  );
};

const Navbar = () => {
  const navigate = useNavigate(); // Définition ici

  const handleLogout = () => {
    localStorage.removeItem('token'); // Supprime le token
    localStorage.removeItem('iduser'); // Supprime l'ID utilisateur
    navigate('/'); // Redirige vers la page d'accueil
  };

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  return (
    <NavbarContainer>
      <LogoContainer>
        <Logo src={logo} alt="SustainaFood Logo" />
        <Title>SustainaFood</Title>
      </LogoContainer>
      <NavLinks>
        <LogoContainer>
        <NavLink to="/">Home</NavLink>
<NavLink to="/About">About</NavLink>
<NavLink to="/Contact">Contact</NavLink>


          {isAuthenticated && (
          <>
          {/* Donations Dropdown */}
          <Dropdown label="Donations" items={['My Donations', 'My Requests', 'List of Donations']} />

          {/* Transporter Section Dropdown */}
          <Dropdown label="Transporter" items={['Assigned Deliveries', 'Route Optimization']}/>

          {/* Analytics & Reporting Dropdown */}
          <Dropdown label="Analytics & Reporting" items={['Donation Statistics', 'Personal Stats']} />

          {/* AI System Dropdown */}
          <Dropdown label="AI System" items={['Food Item Classification', 'Predictions']} />
          <SocialIcons>
          <Link  style={{marginLeft:'40px'}}>
  <FaBell />
</Link>
          </SocialIcons>
          <Link to="/profile">  
            <Logo src={imgmouna} alt="SustainaFood Logo" style={{ marginLeft: '-40px' }} />
          </Link>
         
          <SocialIcons>
          <Link to="/" onClick={handleLogout}>
  <FaSignOutAlt />
</Link>
          </SocialIcons>

          </>
          
        )
        }
         {!isAuthenticated && (
          <>
         <SocialIcons>
          <Link to="/login" onClick={handleLogout} style={{marginLeft:'40px'}}>
  <FaSignInAlt />
</Link>
          </SocialIcons>
          </>
          
        )
        }
        </LogoContainer>
      </NavLinks>
    </NavbarContainer>
  );
};

export default Navbar;
