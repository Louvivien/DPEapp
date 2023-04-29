import React from 'react';
import '../App.css';
import RatingStars from '../components/RatingStars';

const Test = () => {
  return (
    <div>
      <RatingStars rating={4.5.toString()} />
    </div>
  );
};

export default Test;