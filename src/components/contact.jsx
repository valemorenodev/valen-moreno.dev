import React from 'react';
import { useState } from 'react';
import { Container, Row, Col, Form, Modal, Button, Image } from 'react-bootstrap';
import Avatar from '../assets/Avatar.png'
import Download from '../assets/Download.png'
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser'

const Contact = () => {
  //Modal variables (state)
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  //Email JS AUTH
  emailjs.init("AmdLUtFXN7QyLtLIO");

  const [to, setTo] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  //form data
  const handleChangeName = (e) => {
    setTo(e.target.value);
  }
  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  }
  const handleChangeMessage = (e) => {
    setMessage(e.target.value);
  }

  //send email function and validations
  const regex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

  //email js
  function emailDatSend(to, email, message) {
    handleClose() // close modal function
    emailjs.send('service_rl5t3wp', 'template_3qocs2t', { //service id - template id
      to,
      email,
      message
    }, 'AmdLUtFXN7QyLtLIO') //user id
      .then(() => {
        //sweet alert send popup {
        Swal.fire({
          icon: "success",
          title: "Email enviado correctamente",
          text: "Dentro de poco estare en contacto contigo",
        })
      })
      .catch(() => {
        //sweet alert error popup
        Swal.fire({
          icon: "error",
          title: "No se pudo enviar el email",
          text: "revisa los datos escritos e intenta nuevamente mas tarde",
        })
      })

    setTo("")
    setEmail("")
    setMessage("")
  }

  const sendEmail = (to, email, message) => {
    //data validation (if validation is true return to emailDatSend Function)
    if (to === "" || email === "" || message === "") {
      Swal.fire("No pueden haber campos vacios", "", "error", { button: "ok" })
    } else if (!regex.test(email)) {
      Swal.fire("Debes escribir una dirección de correo electrónico válida", "", "error", { button: "ok" })
    } else {
      emailDatSend(to, email, message)
    }
  }
  return (
    <Container id='Contact'>
      <Row>
        <Col className='col-lg-6 col-md-6 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <div id='cvBox'>
            <h2 >View my CV</h2>
            <Image src={Download} />
          </div>
        </Col>
        <Col className='col-lg-6 col-md-6 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <Image
            fluid
            src={Avatar}
          />
        </Col>
      </Row>
      <Row>
        <Col className='col-lg-12 col-md-12 col-sm-12 col-xs-12 my-4 d-flex flex-col justify-content-center'>
          <div id='contactBox' onClick={handleShow}>
            <h1 ><span id='contacTxt'>Charlemos un poco </span>👋🏼</h1>
          </div>
          <Modal show={show} onHide={handleClose} backdrop="static" centered class="modal-main" >
            <Modal.Header closeButton className="modal-header__bg">
              <Modal.Title id="modal-tittle-main">Enviar correo de contacto</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-bg">
              <Form>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre de empresa o remitente"
                    autofocus
                    onChange={handleChangeName}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    onChange={handleChangeEmail}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                  <Form.Label>Mensaje y razón de contacto</Form.Label>
                  <Form.Control as="textarea" rows={3} placeholder="Message" onChange={handleChangeMessage} />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer className="modal-footer__bg">
              <Button variant="primary" onClick={() => sendEmail(to, email, message)} className="Modal-send__but">
                Enviar
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default Contact;
