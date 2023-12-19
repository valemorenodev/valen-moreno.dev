import React from 'react';
import { Container, Row, Image, Col } from 'react-bootstrap';
import './Skills.css'
import Laptop from '../../assets/Laptop.png'
import Blank from '../../assets/Blank.png'
import Palette from '../../assets/Palette.png'
import texts from '../../data/texts.json';

const Skills = ({ language }) => {

  const skillsTexts = texts[language].skills

  return (
    <Container id='Skills' fluid>
      <Row className='skillsItem'>
        <Col className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <h2>{skillsTexts.title}</h2>
        </Col>
      </Row>
      {/*<Row className='skillsItem'>
        <Col className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <Carrusel /> 
        </Col>
      </Row>*/}
      <Row className='skillsItem'>
        <Col className='col-lg-4 col-md-4 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <div className='eclipse'>
            <Image
              fluid
              src={Palette}
            />
          </div>
        </Col>
        <Col className='col-lg-8 col-md-8 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <div className='skillSection'>
            <h4>Front-end</h4>
            <span>{skillsTexts.frontEnd}</span>
          </div>
        </Col>
      </Row>
      <Row className='skillsItem'>
        <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <div className='skillSection'>
            <h4>Back-end</h4>
            <span>{skillsTexts.backEnd}</span>
          </div>
        </div>
        <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <div className='eclipse'>
            <Image
              fluid
              src={Laptop}
            />
          </div>
        </div>
      </Row>
      <Row className='skillsItem'>
        <Col className='col-lg-4 col-md-4 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <div className='eclipse'>
            <Image
              fluid
              src={Blank}
            />
          </div>
        </Col>
        <Col className='col-lg-8 col-md-8 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <div className='skillSection'>
            <h4>DevOps</h4>
            <span>{skillsTexts.devops}</span>
          </div>
        </Col>
      </Row>
      <Row>
        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <div id='Line'></div>
        </div>
      </Row>
    </Container>
  );
}

export default Skills;
