import React from 'react';
import styled from 'styled-components';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background: #56ab2a;
  color: white;
  padding: 40px 20px;
  font-family: 'Poppins', sans-serif;
`;

const FooterContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: center;
  text-align: left;
`;

const Column = styled.div`
  flex: 1 1 250px;
  min-width: 250px;
`;

const ColumnTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 15px;
  color: #d4edda;
`;

const AboutText = styled.p`
  font-size: 14px;
  line-height: 1.6;
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  li {
    margin-bottom: 10px;
  }
  a {
    color: white;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s;
    &:hover {
      text-decoration: underline;
      color: #d4edda;
    }
  }
`;

const ContactInfo = styled.div`
  font-size: 14px;
  line-height: 1.6;
  a {
    color: white;
    text-decoration: none;
    transition: color 0.3s;
    &:hover {
      color: #d4edda;
    }
  }
`;

const SocialIcons = styled.div`
  margin-top: 15px;
  display: flex;
  gap: 15px;
  svg {
    color: white;
    font-size: 20px;
    cursor: pointer;
    transition: transform 0.3s, color 0.3s;
    &:hover {
      transform: scale(1.2);
      color: #d4edda;
    }
  }
`;

const NewsletterForm = styled.form`
  margin-top: 15px;
  display: flex;
  gap: 10px;
            border-radius: 14px;


  input {
    padding: 8px;
    border: none;
    border-radius: 14px;
    flex: 1;
     background: white;
     color:black

  }
  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #d4edda;
    color: #56ab2f;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
    &:hover {
      background: #c1eac1;
    }
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  margin-top: 30px;
  font-size: 13px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: 15px;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        {/* About Section */}
        <Column>
          <ColumnTitle>About SustainaFood</ColumnTitle>
          <AboutText>
            SustainaFood is an innovative food redistribution platform committed to reducing food waste and connecting donors, recipients, and transporters. We empower communities and promote sustainability.
          </AboutText>
        </Column>

        {/* Quick Links */}
        <Column>
          <ColumnTitle>Quick Links</ColumnTitle>
          <FooterLinks>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms & Conditions</a></li>
          </FooterLinks>
        </Column>

        {/* Contact & Social */}
        <Column>
          <ColumnTitle>Contact & Social</ColumnTitle>
          <ContactInfo>
            <p>Email: <a href="mailto:info@sustainafood.com">info@sustainafood.com</a></p>
            <p>Phone: +216 123 456 789</p>
          </ContactInfo>
          <SocialIcons>
            <FaFacebookF />
            <FaTwitter />
            <FaInstagram />
            <FaLinkedinIn />
          </SocialIcons>
          <NewsletterForm>
            <input type="email" placeholder="Subscribe to newsletter" />
            <button type="submit">Subscribe</button>
          </NewsletterForm>
        </Column>
      </FooterContent>
      <FooterBottom>
        © 2025 SustainaFood. All rights reserved.
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;
