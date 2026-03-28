import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

const AddProduct = () => {
  const [image, setImage] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "women",
    size: "M", // default size
    old_price: "",
    new_price: ""
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const Add_Product = async () => {
    console.log(productDetails);
    let responseData;
    let product = productDetails;

    try {
      let formData = new FormData();
      formData.append('product', image);

      // Upload image
      const imageResponse = await fetch("http://localhost:4000/upload", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      }).catch(error => {
        throw new Error("Backend server is not running. Please start your backend server on port 4000");
      });

      responseData = await imageResponse.json();

      if (responseData.success) {
        product.image = responseData.image_url;

        // Add product to DB
        await fetch("http://localhost:4000/addproduct", {
          method: "POST",
          headers: {
            Accept: "application/json",
            'Content-Type': "application/json",
          },
          body: JSON.stringify(product),
        })
        .then((resp) => resp.json())
        .then(data => {
          data.success
            ? alert("✅ Product added successfully!")
            : alert("❌ Failed to add product");
        })
        .catch(error => {
          alert("Error adding product: " + error.message);
        });
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Connection Error: " + error.message);
    }
  };

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          name="name"
          type="text"
          placeholder="Enter product name"
        />
      </div>

      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="text"
            name="old_price"
            placeholder="Enter product price"
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="text"
            name="new_price"
            placeholder="Enter offer price"
          />
        </div>
      </div>

      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="add-product-selector"
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kids">Kids</option>
        </select>
      </div>

      <div className="addproduct-itemfield">
        <p>Available Size</p>
        <select
          value={productDetails.size}
          onChange={changeHandler}
          name="size"
          className="add-product-selector"
        >
          <option value="XS">XS</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
        </select>
      </div>

      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            className="addproduct-thumbnail-img"
            alt=""
          />
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name="image"
          id="file-input"
          hidden
        />
      </div>

      <button onClick={Add_Product} className="addproduct-btn">
        ADD
      </button>
    </div>
  );
};

export default AddProduct;
