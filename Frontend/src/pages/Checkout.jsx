import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/Checkout.css";
import { ShopContext } from "../context/ShopContext";

const Checkout = () => {
  const { getTotalCartAmount, all_product, cartItems, clearCart } =
    useContext(ShopContext);
  const navigate = useNavigate();

  // Form fields
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch user details on mount
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetch("http://localhost:4000/getuser", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "auth-token": token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserEmail(data.email);
          setUserName(data.name);
        }
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, [navigate]);

  // Build items for display and for the API
  const getCartItemsForOrder = () => {
    const items = [];
    for (const itemId in cartItems) {
      const product = all_product.find((p) => p.id === Number(itemId));
      if (product) {
        for (const size in cartItems[itemId]) {
          const quantity = cartItems[itemId][size];
          if (quantity > 0) {
            items.push({
              productId: product.id,
              name: product.name,
              size,
              quantity,
              price: product.new_price,
              image: product.image,
            });
          }
        }
      }
    }
    return items;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handlePlaceOrder = async () => {
    // Validate
    const { fullName, phone, addressLine1, city, state, pincode } = formData;
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      setError("Please fill in all required delivery address fields.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{5,6}$/.test(pincode)) {
      setError("Please enter a valid pincode.");
      return;
    }

    const items = getCartItemsForOrder();
    if (items.length === 0) {
      setError("Your cart is empty. Please add items before placing an order.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth-token");
      const res = await fetch("http://localhost:4000/placeorder", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({
          items: items.map(({ productId, name, size, quantity, price }) => ({
            productId,
            name,
            size,
            quantity,
            price,
          })),
          totalAmount: getTotalCartAmount(),
          deliveryAddress: formData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const amountToPay = getTotalCartAmount();
        clearCart();
        navigate("/payment", {
          state: {
            orderId: data.orderId,
            totalAmount: amountToPay,
            userEmail,
            userName,
          },
        });
      } else {
        setError(data.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Order error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const orderItems = getCartItemsForOrder();
  const totalAmount = getTotalCartAmount();

  return (
    <div className="checkout">
      <h1 className="checkout-title">Checkout</h1>
      <p className="checkout-subtitle">
        Review your order and enter your delivery details
      </p>

      <div className="checkout-container">
        {/* Left – Delivery Form */}
        <div className="checkout-form-section">
          <h2 className="checkout-section-title">
            <span className="icon">📍</span> Delivery Address
          </h2>
          <p className="checkout-section-desc">
            Where should we deliver your order?
          </p>

          {error && (
            <div className="checkout-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="checkout-form-row">
            <div className="checkout-field">
              <label>
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div className="checkout-field">
              <label>
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
              />
            </div>
          </div>

          <div className="checkout-field full-width">
            <label>
              Address Line 1 <span className="required">*</span>
            </label>
            <input
              type="text"
              name="addressLine1"
              placeholder="House no., Street, Locality"
              value={formData.addressLine1}
              onChange={handleChange}
            />
          </div>

          <div className="checkout-field full-width">
            <label>Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              placeholder="Apartment, Landmark (optional)"
              value={formData.addressLine2}
              onChange={handleChange}
            />
          </div>

          <div className="checkout-form-row">
            <div className="checkout-field">
              <label>
                City <span className="required">*</span>
              </label>
              <input
                type="text"
                name="city"
                placeholder="Mumbai"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="checkout-field">
              <label>
                State <span className="required">*</span>
              </label>
              <input
                type="text"
                name="state"
                placeholder="Maharashtra"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="checkout-form-row">
            <div className="checkout-field">
              <label>
                Pincode <span className="required">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                placeholder="400001"
                value={formData.pincode}
                onChange={handleChange}
                maxLength={6}
              />
            </div>
            <div className="checkout-field" />
          </div>

          {/* Contact Email (read-only) */}
          <div className="checkout-email-section">
            <h2 className="checkout-section-title">
              <span className="icon">✉️</span> Contact Email
            </h2>
            <p className="checkout-section-desc">
              Order confirmation will be sent here
            </p>
            <div className="checkout-field full-width">
              <label>Email Address</label>
              <input
                type="email"
                value={userEmail}
                readOnly
                className="readonly-email"
              />
              <span className="checkout-email-note">
                This is your registered email and cannot be changed
              </span>
            </div>
          </div>
        </div>

        {/* Right – Order Summary */}
        <div className="checkout-summary-section">
          <div className="checkout-summary-card">
            <h2 className="checkout-summary-title">
              🛒 Order Summary
            </h2>

            <div className="checkout-summary-items">
              {orderItems.length === 0 ? (
                <p style={{ color: "#aaa", textAlign: "center", padding: 20 }}>
                  Your cart is empty
                </p>
              ) : (
                orderItems.map((item, idx) => (
                  <div className="checkout-summary-item" key={idx}>
                    <img src={item.image} alt={item.name} />
                    <div className="checkout-summary-item-info">
                      <div className="checkout-summary-item-name">
                        {item.name}
                      </div>
                      <div className="checkout-summary-item-meta">
                        Size: {item.size} &nbsp;|&nbsp; Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="checkout-summary-item-price">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))
              )}
            </div>

            <hr className="checkout-summary-divider" />

            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Shipping</span>
              <span style={{ color: "#4caf50", fontWeight: 600 }}>Free</span>
            </div>
            <hr className="checkout-summary-divider" />
            <div className="checkout-summary-row total">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>

            <button
              className="checkout-place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading || orderItems.length === 0}
            >
              {loading ? "Placing Order..." : "Place Order & Pay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
