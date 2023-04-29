import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import RatingStars from './RatingStars';
import { Card } from 'react-bootstrap';

const ProfessionalsList = ({ professionals }) => {
          
    return (
      <div className="d-flex flex-wrap">
          {professionals.map(professional => (
              <Card key={professional.name} className="m-3" style={{ width: '18rem' }}>
                  <Card.Body>
                      <Card.Title>{professional.name}</Card.Title>
                      <Card.Subtitle>{professional.company}</Card.Subtitle>
                      <Card.Text>
                          Addresse : {professional.address} <br />
                          Téléphone : {professional.phone}
                      </Card.Text>
                      {professional.rating && (
                          <div>
                              <RatingStars rating={professional.rating} />
                              <p>
                                  <a href={professional.reviewLink} target="_blank">
                                      {professional.numberOfReview} avis Google
                                  </a>
                              </p>
                          </div>
                      )}
                  </Card.Body>
              </Card>
          ))}
      </div>
  );
};

export default ProfessionalsList;


