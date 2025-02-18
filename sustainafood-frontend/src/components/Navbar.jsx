import React from 'react';
import { Link } from 'react-router-dom'; // Add this import for the Link component
import styled from 'styled-components';
import logo from '../assets/images/logooo.png';
import imgmouna from '../assets/images/imgmouna.png';
import notif from '../assets/images/notif (2).png';

const NavbarContainer = styled.nav`
  background: white;
  padding: 0.1rem 1rem;
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
  height: 70px;
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

const NavLink = styled.li`
        color:black;

  font-size: 1rem;
  cursor: pointer;
  &:hover {
    color:#8dc73f;
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
  return (
    <NavbarContainer>
      <LogoContainer>
        <Logo src={logo} alt="SustainaFood Logo" />
        <Title>SustainaFood</Title>
      </LogoContainer>
      <NavLinks>
        <LogoContainer>
        <Link to="/"> <NavLink>Home</NavLink>          </Link>

          <NavLink>About</NavLink>
          <NavLink>Contact</NavLink>

          {/* Donations Dropdown */}
          <Dropdown label="Donations" items={['My Donations', 'My Requests', 'List of Donations']} />

          {/* Transporter Section Dropdown */}
          <Dropdown label="Transporter" items={['Assigned Deliveries', 'Route Optimization']} />

          {/* Analytics & Reporting Dropdown */}
          <Dropdown label="Analytics & Reporting" items={['Donation Statistics', 'Personal Stats']} />

          {/* AI System Dropdown */}
          <Dropdown label="AI System" items={['Food Item Classification', 'Predictions']} />

          <Logo src={notif} alt="SustainaFood Logo" style={{ width: '45px', height: '45px' }} />
          <Link to="/profile">
            <Logo src={imgmouna} alt="SustainaFood Logo" style={{ marginLeft: '-30px' }} />
          </Link>
        </LogoContainer>
      </NavLinks>
    </NavbarContainer>
  );
};

export default Navbar;
