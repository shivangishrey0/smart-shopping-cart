import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { load } from "@cashfreepayments/cashfree-js";
import "./CSS/Payment.css";

const Payment = () => {
  const { getTotalCartAmount } = useContext(ShopContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");

  const totalAmount = state?.totalAmount ?? getTotalCartAmount();
  const orderId = state?.orderId;

  const handlePayNow = async () => {
    setError("");

    // Cash on Delivery — just go home
    if (paymentMethod === "cod") {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        navigate("/");
      }, 900);
      return;
    }

    // Online Payment via Cashfree
    if (!orderId) {
      setError("Order ID is missing. Please place your order again.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("auth-token");

      // Step 1: Create Cashfree order on backend
      const res = await fetch("http://localhost:4000/create-cashfree-order", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ orderId, totalAmount }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to create payment session.");
        setLoading(false);
        return;
      }

      // Step 2: Initialize Cashfree SDK and open checkout modal
      const cashfree = await load({ mode: "sandbox" });

      const checkoutOptions = {
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal",
      };

      cashfree.checkout(checkoutOptions).then(async (result) => {
        if (result.error) {
          console.log("Payment closed or error:", result.error);
          setError("Payment was cancelled or failed. Please try again.");
          setLoading(false);
          return;
        }

        if (result.redirect) {
          // Payment redirect happened, will be handled via return_url
          return;
        }

        // Step 3: Verify payment on backend
        try {
          const verifyRes = await fetch("http://localhost:4000/verify-payment", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "auth-token": token,
            },
            body: JSON.stringify({ orderId }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success && verifyData.status === "SUCCESS") {
            navigate("/");
          } else {
            setError(
              "Payment could not be verified. Please contact support if amount was deducted."
            );
          }
        } catch (verifyErr) {
          console.error("Verification error:", verifyErr);
          setError("Could not verify payment. Please contact support.");
        }

        setLoading(false);
      });
    } catch (err) {
      console.error("Payment error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h1 className="payment-title">Payment</h1>
        <p className="payment-subtitle">
          Complete your payment to finish the order
        </p>

        {orderId && <p className="payment-order-id">Order ID: {orderId}</p>}

        <div className="payment-summary-row">
          <span>Total Amount</span>
          <strong>₹{totalAmount}</strong>
        </div>

        <div className="payment-methods">
          <label className={paymentMethod === "online" ? "selected" : ""}>
            <input
              type="radio"
              name="payment-method"
              value="online"
              checked={paymentMethod === "online"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Card / UPI / Net Banking
          </label>
          <label className={paymentMethod === "cod" ? "selected" : ""}>
            <input
              type="radio"
              name="payment-method"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Cash on Delivery
          </label>
        </div>

        {error && <div className="payment-error">{error}</div>}

        <button
          className="payment-btn"
          onClick={handlePayNow}
          disabled={loading || totalAmount <= 0}
        >
          {loading
            ? "Processing..."
            : paymentMethod === "cod"
            ? "Confirm Order"
            : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default Payment;