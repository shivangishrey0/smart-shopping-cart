import React, { useState, useRef, useContext, useEffect } from "react";
import { ShopContext } from "../../context/ShopContext";
import { Link } from "react-router-dom";
import "./navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import nav_dropdown from "../Assets/nav_dropdown.png";

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef(null);

  // User state
  const [userName, setUserName] = useState("");

  const isLoggedIn = !!localStorage.getItem("auth-token");

  // Fetch user info on mount
  useEffect(() => {
    if (isLoggedIn) {
      fetch("http://localhost:4000/getuser", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUserName(data.name || data.email || "");
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn]);

  const dropdown_toggle = (e) => {
    if (!menuRef.current) return;
    menuRef.current.classList.toggle("nav-menu-visible");
    e.target.classList.toggle("open");
  };

  const getInitial = () => {
    return userName ? userName.charAt(0).toUpperCase() : "?";
  };

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    window.location.replace("/");
  };

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="logo" />
        <p>Shopper</p>
      </div>

      {/* Dropdown icon for mobile */}
      <img
        className="nav-dropdown"
        onClick={dropdown_toggle}
        src={nav_dropdown}
        alt="dropdown"
      />

      {/* Navigation menu */}
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => setMenu("shop")}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Shop
          </Link>
          {menu === "shop" && <hr />}
        </li>
        <li onClick={() => setMenu("men")}>
          <Link to="/men" style={{ textDecoration: "none", color: "inherit" }}>
            Men
          </Link>
          {menu === "men" && <hr />}
        </li>
        <li onClick={() => setMenu("women")}>
          <Link to="/women" style={{ textDecoration: "none", color: "inherit" }}>
            Women
          </Link>
          {menu === "women" && <hr />}
        </li>
        <li onClick={() => setMenu("kids")}>
          <Link to="/kids" style={{ textDecoration: "none", color: "inherit" }}>
            Kids
          </Link>
          {menu === "kids" && <hr />}
        </li>
      </ul>

      {/* Login / Avatar & Cart */}
      <div className="nav-login-cart">
        {isLoggedIn ? (
          <div className="nav-user-section">
            <div className="nav-user-avatar" title={userName}>
              {getInitial()}
            </div>
            <button className="nav-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}

        <Link to="/cart">
          <img src={cart_icon} alt="cart" />
        </Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </div>
  );
};

export default Navbar;
