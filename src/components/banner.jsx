import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import Avatar from '../assets/Avatar.png'

const Banner = () => {
  return (
    <Container id='Banner' fluid>
      <Row className='justify-content-center'>
        <Col className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <Image
            width={'70%'}
            src={Avatar}
            fluid
          />
        </Col>
      </Row>
    </Container>
  );
}

export default Banner;
