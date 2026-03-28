import React, { useState } from "react";
import "./NewsLetter.css";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() === "") {
      alert("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000); // resets after 4s
    setEmail("");
  };

  return (
    <div className="newsletter">
      <h1>Subscribe to our Newsletter</h1>
      <p>Get updates about new products and offers</p>
      <form className="newsletter-form" onSubmit={handleSubscribe}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className={subscribed ? "subscribed" : ""}
          disabled={subscribed}
        >
          {subscribed ? "✓ Subscribed" : "Subscribe"}
        </button>
      </form>
    </div>
  );
};

export default Newsletter;
