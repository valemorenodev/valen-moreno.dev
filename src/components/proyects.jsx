import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import BadJokes from '../assets/BadJokes.png'
import Cripto from '../assets/Cripto.png'

const Proyects = () => {
  return (
    <Container id='Proyects'>
      <Row>
        <Col className='col-lg-12 col-md-6 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <h2>My Projects</h2>
        </Col>
      </Row>
      <Row>
        <Col className='col-lg-6 col-md-6 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <a href="https://valemorenodev.github.io/bad-jokes/" target={'_blank'}>
            <Card id='proyects' style={{ width: '23rem' }}>
              <Card.Img variant="cover" src={BadJokes} />
              <Card.ImgOverlay id='proyectsTxt'>
                <h2>BadJokes</h2>
              </Card.ImgOverlay>
            </Card>
          </a>
        </Col>
        <Col className='col-lg-6 col-md-6 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <a href="http://cripto-eosin.vercel.app/" target={'_blank'}>
            <Card id='proyects' style={{ width: '23rem' }}>
              <Card.Img variant="cover" src={Cripto} />
              <Card.ImgOverlay id='proyectsTxt'>
                <h2>Cripto</h2>
              </Card.ImgOverlay>
            </Card>
          </a>
        </Col>
      </Row>
      {/* <Row>
        <Col className='col-lg-6 col-md-6 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <Card id='proyects' style={{ width: '23rem' }}>
            <Card.Img variant="cover" src={BadJokes} />
          </Card>
        </Col>
        <Col className='col-lg-6 col-md-6 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <Card id='proyects' style={{ width: '23rem' }}>
            <Card.Img variant="cover" src={BadJokes} />
          </Card>
        </Col>
      </Row> */}
    </Container>
  );
}

export default Proyects;
