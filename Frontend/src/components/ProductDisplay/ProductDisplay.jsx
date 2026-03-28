import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../context/ShopContext";

const ProductDisplay = ({ product }) => {
  const { addToCart } = useContext(ShopContext);
  const [selectedSize, setSelectedSize] = useState("");
  const navigate = useNavigate();

  if (!product) {
    return <p style={{ textAlign: "center" }}>Loading product...</p>;
  }

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!localStorage.getItem("auth-token")) {
      navigate("/login");
      return;
    }
    if (!selectedSize) {
      alert("Please select a size before adding to cart!");
      return;
    }
    addToCart(product.id, selectedSize);
    alert(`Added ${product.name} (${selectedSize}) to cart`);
  };

  // Get available sizes from backend (string like "S,M,L,XL")
  const availableSizes = product.size
    ? product.size.split(",").map((s) => s.trim())
    : ["S", "M", "L", "XL"];

  return (
    <div className="productdisplay">
      {/* LEFT SIDE - IMAGE SECTION */}
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={product.image} alt={product.name} />
          <img src={product.image} alt={product.name} />
          <img src={product.image} alt={product.name} />
          <img src={product.image} alt={product.name} />
        </div>

        <div className="productdisplay-img">
          <img
            className="productdisplay-main-img"
            src={product.image}
            alt={product.name}
          />
        </div>
      </div>

      {/* RIGHT SIDE - DETAILS */}
      <div className="productdisplay-right">
        <h1>{product.name}</h1>

        <div className="productdisplay-right-star">
          {[...Array(4)].map((_, i) => (
            <img key={i} src={star_icon} alt="star" />
          ))}
          <img src={star_dull_icon} alt="dull star" />
          <p>(122)</p>
        </div>

        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">
            ₹{product.old_price}
          </div>
          <div className="productdisplay-right-price-new">
            ₹{product.new_price}
          </div>
        </div>

        <div className="productdisplay-right-description">
          {product.description ||
            "A lightweight, comfortable shirt perfect for daily wear."}
        </div>

        <h1>Select Size</h1>
        <div className="productdisplay-right-size">
          {availableSizes.map((size) => (
            <div
              key={size}
              onClick={() => handleSizeSelect(size)}
              className={`size-option ${
                selectedSize === size ? "selected-size" : ""
              }`}
            >
              {size}
            </div>
          ))}
        </div>

        <button onClick={handleAddToCart}>ADD TO CART</button>

        <p className="productdisplay-right-category">
          <span>Category: </span>
          {product.category || "General"}
        </p>
        <p className="productdisplay-right-category">
          <span>Tags: </span>Modern, Latest
        </p>
      </div>
    </div>
  );
};

export default ProductDisplay;
