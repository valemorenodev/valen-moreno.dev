import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import GitHub from '../assets/GitHub.png'
import LinkedIn from '../assets/LinkedIn.png'
const Footer = () => {
  return (
    <Container id='Footer'>
      <Row>
        <Col className='col-lg-6 col-md-6 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <a href="https://github.com/valemorenodev" target={'_blank'}><h3>valemorenodev</h3></a>
        </Col>
        <Col className='col-lg-6 col-md-6 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <h4><a href="https://www.linkedin.com/in/diana-valentina-moreno/" target={'_blank'}><span><img src={LinkedIn} /></span></a></h4>
          <h4><a href='https://github.com/valemorenodev' target={'_blank'}><span><img src={GitHub} /></span></a></h4>
        </Col>
      </Row>
    </Container>
  );
}

export default Footer;
