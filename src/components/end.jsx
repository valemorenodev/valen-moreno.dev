import React from 'react';
import { Container, Row, Image } from 'react-bootstrap';
import Avatar from '../assets/Avatar.png'

const End = () => {
  return (
    <Container>
      <Row>
        <Image
          fluid
          src={Avatar}
        />
      </Row>
    </Container>
  );
}

export default End;
