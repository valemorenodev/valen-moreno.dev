import React from 'react';
import { Container, Image } from 'react-bootstrap';
import Avatar from '../assets/Avatar.png'

const Banner = () => {
  return (
    <Container id='Banner' fluid='md'>
      <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
        <Image
          width={'70%'}
          src={Avatar}
          fluid
        />
      </div>
    </Container>
  );
}

export default Banner;
