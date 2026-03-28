import React, { useState, useEffect, useRef } from 'react';
import './CSS/LoginSignup.css';

const GOOGLE_CLIENT_ID = "151735782702-a5gl3a9doa7ttu1bqjebe1m48div09b0.apps.googleusercontent.com";

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // OTP states
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  // Google login state
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef(null);

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });

        // Render the Google button
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(
            googleBtnRef.current,
            {
              theme: "outline",
              size: "large",
              width: "100%",
              text: "signin_with",
              shape: "rectangular",
              logo_alignment: "center",
            }
          );
        }
      }
    };

    // Wait for the Google script to load
    if (window.google && window.google.accounts) {
      initializeGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(interval);
          initializeGoogle();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(interval), 10000);
    }
  }, []);

  // Google Sign-In callback
  const handleGoogleCallback = async (response) => {
    setGoogleLoading(true);
    try {
      const res = await fetch('http://localhost:4000/auth/google', {
        method: 'POST',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('auth-token', data.token);
        window.location.replace("/");
      } else {
        alert(data.errors || "Google login failed. Please try again.");
      }
    } catch (error) {
      alert("Network error during Google login. Please try again.");
    }
    setGoogleLoading(false);
  };

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gmail validation function
  const isValidGmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  };

  // Reset OTP state (when switching between Login/SignUp or changing email)
  const resetOtpState = () => {
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setOtpMessage("");
  };

  const switchState = (newState) => {
    setState(newState);
    resetOtpState();
  };

  // Step 1: Send OTP to the email (Used for both Login and Signup)
  const sendOtp = async () => {
    if (!isValidGmail(formData.email)) {
      alert("Please use a valid Gmail address (must end with @gmail.com)");
      return;
    }

    // Validation specific to Sign Up
    if (state === "Sign Up") {
      if (!formData.username.trim()) {
        alert("Please enter a username");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (formData.password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }
    } else {
      // Validation specific to Login
      if (!formData.password) {
        alert("Please enter your password");
        return;
      }
    }

    setOtpLoading(true);
    setOtpMessage("");

    try {
      let responseData;
      await fetch('http://localhost:4000/send-otp', {
        method: 'POST',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // Pass the 'type' (Login or Sign Up) so the backend can check if the user exists
        body: JSON.stringify({ email: formData.email, type: state }),
      })
        .then((response) => response.json())
        .then((data) => responseData = data);

      if (responseData.success) {
        setOtpSent(true);
        setOtpMessage("OTP sent to your email! Check your inbox.");
      } else {
        setOtpMessage(responseData.errors || "Failed to send OTP. Try again.");
      }
    } catch (error) {
      setOtpMessage("Network error. Please try again.");
    }
    setOtpLoading(false);
  };

  // Step 2: Verify the OTP
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpMessage("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    setOtpMessage("");

    try {
      let responseData;
      await fetch('http://localhost:4000/verify-otp', {
        method: 'POST',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, otp: otp }),
      })
        .then((response) => response.json())
        .then((data) => responseData = data);

      if (responseData.success) {
        setOtpVerified(true);
        setOtpMessage("Email verified successfully!");
      } else {
        setOtpMessage(responseData.errors || "OTP verification failed.");
      }
    } catch (error) {
      setOtpMessage("Network error. Please try again.");
    }
    setOtpLoading(false);
  };

  // Step 3a: Complete Login after OTP verification
  const login = async () => {
    if (!otpVerified) {
      alert("Please verify your email with OTP first.");
      return;
    }

    let responseData;
    await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: formData.email, password: formData.password }),
    })
      .then((response) => response.json())
      .then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors || responseData.message || "Login failed");
    }
  };

  // Step 3b: Complete Signup after OTP verification
  const signup = async () => {
    if (!otpVerified) {
      alert("Please verify your email with OTP first.");
      return;
    }

    let responseData;
    await fetch('http://localhost:4000/signup', {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password
      }),
    })
      .then((response) => response.json())
      .then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors || responseData.message || "Signup failed");
    }
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Sign Up" ? (
            <input
              name='username'
              value={formData.username}
              onChange={changeHandler}
              type="text"
              placeholder='Username'
              disabled={otpSent}
            />
          ) : null}

          <input
            name="email"
            value={formData.email}
            onChange={(e) => {
              changeHandler(e);
              resetOtpState();
            }}
            type="email"
            placeholder='Email Address'
            disabled={otpSent}
          />

          <input
            name="password"
            value={formData.password}
            onChange={(e) => {
              changeHandler(e);
              resetOtpState();
            }}
            type="password"
            placeholder='Password'
            disabled={otpSent}
          />

          {state === "Sign Up" ? (
            <input
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={changeHandler}
              type="password"
              placeholder='Confirm Password'
              disabled={otpSent}
            />
          ) : null}

          {/* OTP Section for BOTH Login and Sign Up */}
          {otpSent && !otpVerified ? (
            <div className="otp-section">
              <input
                className="otp-input"
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder='Enter 6-digit OTP'
              />
              <button
                className="otp-verify-btn"
                onClick={verifyOtp}
                disabled={otpLoading}
              >
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          ) : null}
        </div>

        {/* OTP status message */}
        {otpMessage ? (
          <p className={`otp-message ${otpVerified ? 'otp-success' : ''}`}>
            {otpMessage}
          </p>
        ) : null}

        {/* Dynamic Buttons based on OTP state */}
        {!otpSent ? (
          <button onClick={sendOtp} disabled={otpLoading}>
            {otpLoading ? "Sending OTP..." : `Send OTP to ${state}`}
          </button>
        ) : otpVerified ? (
          <button onClick={state === "Login" ? login : signup}>
            {state === "Login" ? "Login" : "Complete Sign Up"}
          </button>
        ) : (
          <button disabled style={{ opacity: 0.5 }}>
            Please Verify OTP First
          </button>
        )}

        {/* Resend OTP link */}
        {otpSent && !otpVerified ? (
          <p className='otp-resend' onClick={sendOtp}>
            Didn't receive the OTP? <span>Resend OTP</span>
          </p>
        ) : null}

        {/* Google Login Divider and Button */}
        <div className="login-divider">
          <span>OR</span>
        </div>

        <div className="google-login-section">
          <div ref={googleBtnRef} className="google-btn-container"></div>
          {googleLoading && (
            <p className="google-loading-text">Signing in with Google...</p>
          )}
        </div>

        {/* Toggle between Login and Sign up */}
        {state === "Sign Up" ? (
          <p className='loginsignup-login'>
            Already have an account?{" "}
            <span onClick={() => switchState("Login")}>Login here</span>
          </p>
        ) : (
          <p className='loginsignup-login'>
            Create an account{" "}
            <span onClick={() => switchState("Sign Up")}>Click here</span>
          </p>
        )}

        <div className='loginsignup-agree'>
          <input type='checkbox' />
          <p>
            By continuing, I agree to the terms of use & privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;