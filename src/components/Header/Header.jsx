import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import './Header.css'
import Logo from '../../assets/Logo.png'

const Header = () => {
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
            <Nav.Link href="#Skills">Skills</Nav.Link>
            <Nav.Link href="#Proyects">Projects</Nav.Link>
            <Nav.Link href="#Contact">Contact</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
