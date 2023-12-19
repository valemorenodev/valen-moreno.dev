import React, { useState } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import './Header.css'
import Logo from '../../assets/Logo.png'
import texts from '../../data/texts.json'

const Header = ({ language, onLanguageToggle }) => {

  const currentTexts = texts[language].header;

  return (
    <Navbar id='Header' expand="lg" fixed="top">
      <Container>
        <Navbar.Brand href="#Banner">
          <img
            alt=""
            src={Logo}
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{' '}
          Vale Moreno
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="justify-content-end">
            <Nav.Link href="#Skills">{currentTexts.links.skills}</Nav.Link>
            <Nav.Link href="#Proyects">{currentTexts.links.projects}</Nav.Link>
            <Nav.Link href="#Contact">{currentTexts.links.contact}</Nav.Link>
            <button onClick={onLanguageToggle}>
              {language === 'en' ? 'ESP' : 'ENG'}
            </button>
          </Nav>
        </Navbar.Collapse>

      </Container>
    </Navbar>
  );
}

export default Header;
