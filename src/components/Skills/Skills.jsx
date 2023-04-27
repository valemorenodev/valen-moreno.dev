import React from 'react';
import { Container, Row, Image, Col } from 'react-bootstrap';
import './Skills.css'
import Laptop from '../../assets/Laptop.png'
import Palette from '../../assets/Palette.png'

const Skills = () => {
  return (
    <Container id='Skills' fluid>
      <Row className='skillsItem'>
        <Col className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <h2>My Skills</h2>
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
              src={Laptop}
            />
          </div>
        </Col>
        <Col className='col-lg-8 col-md-8 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <div className='skillSection'>
            <h4>Development</h4>
            <span>Tengo experiencia en el desarrollo de aplicaciones web utilizando tecnologías como HTML, CSS, JavaScript, TypeScript, Angular, React JS, Bootstrap y Tailwind.</span>
            <span>Además, tengo habilidades en metodologías ágiles como Scrum, y en herramientas como Docker, Portainer, MySql, Net Core, Sonarqube, Linux, ingreso a máquinas virtuales de manera remota y manejo de variables de entorno.</span>
          </div>
        </Col>
      </Row>
      <Row className='skillsItem'>
        <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center' >
          <div className='skillSection'>
            <h4>Design</h4>
            <span>Tengo experiencia en fundamentos de UI/Design & UX/Design, y habilidades avanzadas en el manejo de Figma y Adobe XD. Con estas herramientas, he creado mockups y prototipos de alta calidad que han sido implementados con éxito en proyectos de diseño.</span>
            <span>Además, tengo un buen ojo para el detalle y la estética, lo que me permite crear diseños funcionales y atractivos para los usuarios. Trabajo bien en equipo y tengo habilidades para la comunicación efectiva de mis ideas.</span>
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
