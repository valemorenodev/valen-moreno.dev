import React from 'react';
import { Container, Row, Image } from 'react-bootstrap';
import Laptop from '../assets/Laptop.png'
import Palette from '../assets/Palette.png'

const Skills = () => {
  return (
    <Container id='Skills' fluid>
      <Row className='skillsItem'>
        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <h2>My Skills</h2>
        </div>
      </Row>
      <Row className='skillsItem'>
        <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <div className='eclipse'>
            <Image
              fluid
              src={Laptop}
            />
          </div>
        </div>
        <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <div className='skillSection'>
            <h4>Development</h4>
            <span>Desarrolladora Front-end con mas 1 año de experiencia laboral certificable con HTML, CSS, JavaScript, TypeScript, Angular, React js, Boostrap y Taildwind.</span>
            <span>Otras habilidades tècnicas: metodologia agile Scrum, Docker, Portainer, mySql, Net Core, Sonarqube, Linux, ingreso maquinas virtuales de manera remota y manejo de variables de entorno.</span>
          </div>
        </div>
      </Row>
      <Row className='skillsItem'>
        <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <div className='skillSection'>
            <h4>Design</h4>
            <span>Fundamentos de UI/Desing & UX/Desing, manejo de Figma y Adobe XD</span>
          </div>
        </div>
        <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <div className='eclipse'>
            <Image
              fluid
              src={Palette}
            />
          </div>
        </div>
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
