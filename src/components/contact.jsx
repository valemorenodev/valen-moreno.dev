import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Contact = () => {
  return (
    <Container id='Contact'>
      <Row>
        <Col className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <div id='contactBox'>
            <h1 ><span id='contacTxt'>Charlemos un poco </span>👋🏼</h1>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Contact;
