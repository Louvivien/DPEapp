import React from 'react';

const RatingStars = ({ rating }) => {
  //rating = parseFloat(rating.replace(",","."));
  let width = Math.floor(rating * 14);
  return (
    <span className="z3HNkc" aria-label={`Rated ${rating} out of 5`} role="img">
      <span style={{ width: `${width}px` }}></span>
    </span>
  )
};

export default RatingStars;



