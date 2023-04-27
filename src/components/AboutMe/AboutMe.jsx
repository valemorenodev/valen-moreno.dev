import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './AboutMe.css'

const AboutMe = () => {
  return (
    <Container id='AboutMe'>
      <Row>
        <Col className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <div className='AboutMeBox'>
            <h4 className='AboutMeText'>
              🚀 ¡Hola! Soy Valentina, una desarrolladora Full Stack con un fuerte enfoque en React (Front end) y Express (Back end) y más de 2 años de experiencia. Soy una persona curiosa, apasionada e inquieta y siempre estoy investigando para enfrentar nuevos desafíos. Me considero un miembro altamente colaborativo del equipo y estoy comprometida en generar conocimiento a través del trabajo en equipo.
            </h4>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default AboutMe;
