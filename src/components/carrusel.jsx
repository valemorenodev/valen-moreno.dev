import React from 'react';
import { Carousel } from 'react-bootstrap';
import Angular from '../assets/Angular.png'
import Vite from '../assets/Vite.png'
import ReactImg from '../assets/ReactImg.png';
import JavaScript from '../assets/JavaScript.png'

const Carrusel = () => {
  return (
    <Carousel>
      <Carousel.Item interval={2000} id='CarrruselImg'>
        <img
          className="d-block w-100"
          src={Angular}
          alt="First slide"
        />
      </Carousel.Item>
      <Carousel.Item interval={1500} id='CarrruselImg'>
        <img
          className="d-block w-100"
          src={Vite}
          alt="Second slide"
        />
      </Carousel.Item>
      <Carousel.Item interval={1000} id='CarrruselImg'>
        <img
          className="d-block w-100"
          src={ReactImg}
          alt="Third slide"
        />
      </Carousel.Item>
      <Carousel.Item interval={500} id='CarrruselImg'>
        <img
          className="d-block w-100"
          src={JavaScript}
          alt="Third slide"
        />
      </Carousel.Item>
    </Carousel>
  )
}

export default Carrusel;
