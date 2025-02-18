import React from 'react';
import styled from 'styled-components';
import logo from '../assets/images/logooo.png';

const NavbarContainer = styled.nav`
  background: #8dc73f;
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
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.ul`
  list-style: none;
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled.li`
  color: white;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const Navbar = () => {
  return (
    <NavbarContainer>
      <LogoContainer>
        <Logo src={logo} alt="SustainaFood Logo" />
        <Title>SustainaFood</Title>
      </LogoContainer>
      <NavLinks>
        <NavLink>Home</NavLink>
        <NavLink>About</NavLink>
        <NavLink>Contact</NavLink>
      </NavLinks>
    </NavbarContainer>
  );
};

export default Navbar;
