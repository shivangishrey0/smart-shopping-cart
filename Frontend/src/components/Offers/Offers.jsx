import React from 'react'
import { Link } from 'react-router-dom'
import './Offers.css'
import exclusive_image from '../Assets/exclusive_image.png'

const Offers = () => {
  return (
    <div className='offers'>
      <div className="offers-left">
        <h1>EXCLUSIVE</h1>
        <h1>Offers For You</h1>
        <p>ONLY ON BEST SELLERS PRODUCT</p>
        <Link to="/women" style={{ textDecoration: 'none' }}>
          <button>Check Now</button>
        </Link>
      </div>
      <div className="offers-right">
        <img src={exclusive_image} alt="offer image"/>
      </div>
    </div>
  )
}

export default Offers