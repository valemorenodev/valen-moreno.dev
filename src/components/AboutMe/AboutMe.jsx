import React from 'react';
import texts from '../../data/texts.json';
import { Container, Row, Col } from 'react-bootstrap';
import './AboutMe.css'

const AboutMe = ({ language }) => {

  const aboutMeText = texts[language].aboutMe;

  return (
    <Container id='AboutMe'>
      <Row>
        <Col className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <div className='AboutMeBox'>
            <h4 className='AboutMeText'>
              {aboutMeText}
            </h4>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default AboutMe;
