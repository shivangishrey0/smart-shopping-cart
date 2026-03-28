import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./CartItems.css";
import { ShopContext } from "../../context/ShopContext";
import remove_icon from "../Assets/cart_cross_icon.png";

const CartItems = () => {
  const { getTotalCartAmount, all_product, cartItems, removeFromCart } =
    useContext(ShopContext);
  const navigate = useNavigate();

  // Helper function to get cart items in a flat format for display
  const getCartItemsForDisplay = () => {
    const items = [];
    
    for (const itemId in cartItems) {
      const product = all_product.find(p => p.id === Number(itemId));
      
      if (product) {
        for (const size in cartItems[itemId]) {
          const quantity = cartItems[itemId][size];
          
          if (quantity > 0) {
            items.push({
              product,
              size,
              quantity,
              key: `${itemId}-${size}` // unique key
            });
          }
        }
      }
    }
    
    return items;
  };

  const handleProceedToCheckout = () => {
    if (!localStorage.getItem("auth-token")) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  const cartItemsDisplay = getCartItemsForDisplay();

  return (
    <div className="cartitems">

      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Size</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />

      {cartItemsDisplay.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
        </div>
      ) : (
        cartItemsDisplay.map((item) => (
          <div key={item.key}>
            <div className="cartitems-format">
              <div className="cartitems-product">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="carticon-products-icon"
                />
              </div>
              <div className="cartitems-title">
                <p>{item.product.name}</p>
              </div>
              <div className="cartitems-size">
                <p>{item.size}</p>
              </div>
              <div className="cartitems-price">
                <p>₹{item.product.new_price}</p>
              </div>
              <div className="cartitems-quantity">
                <button>{item.quantity}</button>
              </div>
              <div className="cartitems-total">
                <p>₹{item.product.new_price * item.quantity}</p>
              </div>
              <div className="cartitems-remove">
                <img
                  src={remove_icon}
                  alt="remove"
                  className="cartitems-remove-icon"
                  onClick={() => removeFromCart(item.product.id, item.size)}
                />
              </div>
            </div>
            <hr />
          </div>
        ))
      )}

      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>₹{getTotalCartAmount()}</h3>
            </div>
          </div>
          <button onClick={handleProceedToCheckout}>PROCEED TO CHECKOUT</button>
        </div>

        <div className="cartitems-promocode">
          <p>If you have a promocode, Enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;