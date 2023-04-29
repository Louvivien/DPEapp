import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import ProfessionalsList from './/components/ProfessionalsList';
import CitySearch from './/components/CitySearch';
import ReactGA from 'react-ga';
  const TRACKING_ID = "XXXX"; 
  ReactGA.initialize(TRACKING_ID);
  ReactGA.pageview(window.location.pathname + window.location.search);

const App = () => {
  const [professionals, setProfessionals] = useState([]);
  const [cityValue, setCityValue] = useState('');
  const [postalCodeValue, setPostalCodeValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT

  const handleSubmit = event => {
    event.preventDefault();
    // Track Submit in GA
    ReactGA.event({
      category: 'Submit',
      action: 'Submitted a city'
    });  
    // Set isLoading to true before sending the request
    setIsLoading(true);
    axios.get(`${API_ENDPOINT}/api/dpe?city=${cityValue}&postalcode=${postalCodeValue}`)
      .then(response => {
        // Update the response state with the server's response
        setProfessionals(response.data);
        // Set isLoading to false
        setIsLoading(false);
        // Reset isLoading to false after the response has been displayed
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (

    <Container>
      <Row className="justify-content-center mt-5">
        <Col xs={12} md={6}>
          <h1 className="text-center mb-3">Rechercher un professionnel certifié DPE</h1>
          <p className="text-center mb-5">Saisissez une commune pour trouver un professionnel certifié pour réaliser un DPE</p>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
            <CitySearch setCity={setCityValue} setPostalCode={setPostalCodeValue} />
            </Form.Group>
            <div className="text-center"style={{ marginTop: "5px", }}>
            <Button type="submit" variant="primary">Rechercher</Button>
            </div>
          </Form>
        </Col>
      </Row>
        
      {isLoading ? (

              <div style={{ marginTop: "10px", }}>

                <Container>
                    <Row>
                      <Col className="text-center">Chargement..</Col>
                    </Row>
                </Container>

              </div>

              ) : (

              <div>
                {professionals ? (
                  <Container style={{ marginTop: '20px' }}>
                    {professionals.length > 0 && <ProfessionalsList professionals={professionals} />}
                  </Container>
                ) : null}
              </div>


              )}


    </Container>






  );
};

export default App;
