import React from 'react';
import texts from '../../data/texts.json';
import { Container } from 'react-bootstrap';
import './Hero.css'

const Hero = ({ language }) => {

  const HeroText = texts[language].hero

  return (
    <Container id='Hero' fluid>
      <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
        <p>“{HeroText}”</p>
      </div>
      <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
        <h2>Aida Lovelance</h2>
      </div>
      <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
        <div id='Line'></div>
      </div>
    </Container >
  );
}

export default Hero;
