import React, { createContext, useState, useEffect } from "react";
import all_product from "../components/Assets/all_product";

export const ShopContext = createContext(null);

// Default cart: nested structure with sizes
const getDefaultCart = () => {
  let cart = {};
  for (let product of all_product) {
    cart[product.id] = {
      S: 0,
      M: 0,
      L: 0,
      XL: 0
    };
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(getDefaultCart());

  // Load cart from backend on mount when user is logged in
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      fetch("http://localhost:4000/getcart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({}),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data === "object") {
            // Merge backend data into our nested structure
            const newCart = getDefaultCart();
            for (const key in data) {
              if (data[key] > 0 && newCart[key]) {
                // Backend stores flat count — put it in "M" as default size
                newCart[key]["M"] = data[key];
              }
            }
            setCartItems(newCart);
          }
        })
        .catch((err) => console.error("Error loading cart:", err));
    }
  }, []);

  // Add to cart with size (also syncs to backend)
  const addToCart = (itemId, size) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [size]: prev[itemId][size] + 1
      }
    }));

    // Sync with backend
    const token = localStorage.getItem("auth-token");
    if (token) {
      fetch("http://localhost:4000/addtocart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ itemId: itemId }),
      })
        .then((res) => res.json())
        .then((data) => console.log("Cart synced:", data.message))
        .catch((err) => console.error("Error syncing cart:", err));
    }
  };

  // Remove from cart (also syncs to backend)
  const removeFromCart = (itemId, size) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [size]: Math.max(prev[itemId][size] - 1, 0)
      }
    }));

    // Sync with backend
    const token = localStorage.getItem("auth-token");
    if (token) {
      fetch("http://localhost:4000/removefromcart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ itemId: itemId }),
      })
        .then((res) => res.json())
        .then((data) => console.log("Cart synced:", data.message))
        .catch((err) => console.error("Error syncing cart:", err));
    }
  };

  // Calculate total amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = all_product.find(
        (product) => product.id === Number(itemId)
      );
      if (itemInfo) {
        for (const size in cartItems[itemId]) {
          totalAmount += itemInfo.new_price * cartItems[itemId][size];
        }
      }
    }
    return totalAmount;
  };

  // Total item count (all sizes)
  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        totalItem += cartItems[itemId][size];
      }
    }
    return totalItem;
  };


  // Clear the cart (all items, all sizes)
  const clearCart = () => {
    setCartItems(getDefaultCart());
  };

  const contextValue = {
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
    clearCart,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;

