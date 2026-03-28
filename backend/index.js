require("dotenv").config();
const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { Cashfree, CFEnvironment } = require("cashfree-pg");

// Cashfree Configuration
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = CFEnvironment.SANDBOX; // Change to CFEnvironment.PRODUCTION when going live

app.use(express.json());
app.use(cors());

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// In-memory OTP store: email -> { otp, expiresAt }
const otpStore = new Map();

//  MongoDB Connection
mongoose.connect("mongodb+srv://shival:shivangi20@cluster20.tkkat9n.mongodb.net/e-commerce")
  .then(() => console.log(" MongoDB Connected"))
  .catch(err => console.log(" MongoDB Connection Error:", err));

// Test API
app.get("/", (req, res) => {
  res.send("Express App is running successfully!");
});

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "upload", "images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Serve uploaded images statically
app.use("/images", express.static(path.join(__dirname, "upload", "images")));

// Image Upload Endpoint
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: 0,
      message: "No file uploaded. Make sure the form field name is 'product'."
    });
  }

  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  });
});

// Product Schema
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  sizes: { type: [String], default: ["S", "M", "L", "XL"] },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true }
});


// Add Product Endpoint
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

  try {
    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price
    });

    await product.save();
    console.log("Product saved:", product.name);
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    console.error(" Error saving product:", error);
    res.status(500).json({ success: false, message: "Error saving product" });
  }
});

// Delete Product Endpoint
app.post('/removeproduct', async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed product:", req.body.name);
  res.json({ success: true, name: req.body.name });
});

// Get All Products
app.get('/allproducts', async (req, res) => {
  let products = await Product.find({});
  console.log("All products fetched");
  res.send(products);
});

//User Schema
const Users = mongoose.model('Users', {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now }
});

// Order Schema
const Order = mongoose.model('Order', {
  userId: { type: String, required: true },
  email: { type: String, required: true },
  items: [{
    productId: Number,
    name: String,
    size: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  deliveryAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now }
});

// Send OTP Endpoint
// Send OTP Endpoint (Updated to check user existence)
app.post('/send-otp', async (req, res) => {
  const { email, type } = req.body; 
  if (!email) {
    return res.status(400).json({ success: false, errors: "Email is required" });
  }

  // Database checks based on whether the user is trying to Login or Signup
  let userExists = await Users.findOne({ email });
  
  if (type === 'Login' && !userExists) {
    return res.status(400).json({ success: false, errors: "No account found with this email." });
  }
  
  if (type === 'Sign Up' && userExists) {
    return res.status(400).json({ success: false, errors: "An account already exists with this email." });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Store OTP
  otpStore.set(email, { otp, expiresAt });

  try {
    await transporter.sendMail({
      from: `"Smart Shopping Cart" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP for Verification",
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:30px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#ff414f;text-align:center;">Email Verification</h2>
        <p style="font-size:16px;color:#333;">Your One-Time Password (OTP) is:</p>
        <div style="text-align:center;margin:25px 0;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#ff414f;background:#fff0f1;padding:12px 24px;border-radius:8px;">${otp}</span>
        </div>
        <p style="font-size:14px;color:#888;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
      </div>`,
    });

    console.log(`OTP sent to ${email}`);
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ success: false, errors: "Failed to send OTP. Please try again." });
  }
});

// Verify OTP Endpoint
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, errors: "Email and OTP are required" });
  }

  const stored = otpStore.get(email);
  if (!stored) {
    return res.json({ success: false, errors: "No OTP found. Please request a new one." });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return res.json({ success: false, errors: "OTP has expired. Please request a new one." });
  }

  if (stored.otp !== otp) {
    return res.json({ success: false, errors: "Invalid OTP. Please try again." });
  }

  // OTP is valid — remove it
  otpStore.delete(email);
  console.log(`OTP verified for ${email}`);
  res.json({ success: true, message: "OTP verified successfully" });
});

// User Signup
app.post('/signup', async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, errors: "User already exists" });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = { user: { id: user.id } };
  const token = jwt.sign(data, 'secret_ecom');
  res.json({ success: true, token });
});

// User Login
app.post('/login', async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (!user) return res.json({ success: false, errors: "Wrong Email Id" });

  const passCompare = req.body.password === user.password;
  if (!passCompare) return res.json({ success: false, errors: "Wrong Password" });

  const data = { user: { id: user.id } };
  const token = jwt.sign(data, 'secret_ecom');
  res.json({ success: true, token });
});

// Google Auth
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ success: false, errors: "Google credential is required" });
  }

  try {
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Find or create user
    let user = await Users.findOne({ email });
    if (!user) {
      let cart = {};
      for (let i = 0; i < 300; i++) cart[i] = 0;

      user = new Users({
        name: name || email.split('@')[0],
        email: email,
        password: `google_${googleId}_${Date.now()}`, // placeholder password for Google users
        cartData: cart,
      });
      await user.save();
      console.log("New Google user created:", email);
    }

    const data = { user: { id: user.id } };
    const token = jwt.sign(data, 'secret_ecom');
    console.log("Google login successful for:", email);
    res.json({ success: true, token });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ success: false, errors: "Google authentication failed. Please try again." });
  }
});

//Middleware to fetch user data
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, 'secret_ecom');
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Invalid token" });
  }
};

// Place Order Endpoint
app.post('/placeorder', fetchUser, async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress } = req.body;

    // Validate required fields
    if (!items || !items.length || !totalAmount || !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Missing required order details' });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = deliveryAddress;
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'Incomplete delivery address' });
    }

    // Get user email from their account
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create the order
    const order = new Order({
      userId: req.user.id,
      email: user.email,
      items,
      totalAmount,
      deliveryAddress
    });

    await order.save();
    console.log('Order placed by:', user.email, '| Order ID:', order._id);

    // Clear user's cart after placing order
    let cart = {};
    for (let i = 0; i < 300; i++) cart[i] = 0;
    await Users.findByIdAndUpdate(req.user.id, { cartData: cart });

    // Send order confirmation email
    try {
      await transporter.sendMail({
        from: `"Smart Shopping Cart" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `Order Confirmed - #${order._id}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:30px;border:1px solid #eee;border-radius:8px;">
          <h2 style="color:#ff414f;text-align:center;">Order Confirmed! 🎉</h2>
          <p style="font-size:16px;color:#333;">Hi <strong>${user.name}</strong>,</p>
          <p style="font-size:15px;color:#555;">Your order <strong>#${order._id}</strong> has been placed successfully.</p>
          <p style="font-size:15px;color:#555;">Total: <strong>₹${totalAmount}</strong></p>
          <p style="font-size:15px;color:#555;">Delivering to: <strong>${fullName}</strong>, ${addressLine1}, ${city}, ${state} - ${pincode}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
          <p style="font-size:13px;color:#aaa;text-align:center;">Thank you for shopping with Smart Shopping Cart!</p>
        </div>`,
      });
      console.log('Order confirmation email sent to:', user.email);
    } catch (emailErr) {
      console.error('Failed to send order confirmation email:', emailErr);
      // Don't fail the order if email fails
    }

    res.json({ success: true, orderId: order._id });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

// New Collection
app.get('/newcollection', async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(-8);
  console.log('New Collection fetched');
  res.send(newcollection);
});

// Popular in Women
app.get('/popularinwomen', async (req, res) => {
  let products = await Product.find({ category: "women" });
  let popular_in_women = products.slice(0, 4);
  console.log("Popular in women fetched");
  res.send(popular_in_women);
});

// Get User Info (for navbar avatar)
app.get('/getuser', fetchUser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, errors: "User not found" });
    }
    res.json({ success: true, name: user.name, email: user.email });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Add to Cart
app.post('/addtocart', fetchUser, async (req, res) => {
  try {
    let userData = await Users.findById(req.user.id);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    userData.cartData[req.body.itemId] = (userData.cartData[req.body.itemId] || 0) + 1;
    await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });

    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Remove from Cart
app.post('/removefromcart', fetchUser, async (req, res) => {
  try {
    let userData = await Users.findById(req.user.id);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    userData.cartData[req.body.itemId] = Math.max(0, (userData.cartData[req.body.itemId] || 0) - 1);
    await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });

    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// creating endpoint to get cartData
app.post('/getcart',fetchUser,async(req,res)=>{
  console.log("GetCart");
  let userData = await Users.findOne({_id:req.user.id});
  res.json(userData.cartData);
  
})

// Create Cashfree Order
app.post('/create-cashfree-order', fetchUser, async (req, res) => {
  try {
    const { orderId, totalAmount } = req.body;

    if (!orderId || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Order ID and amount are required' });
    }

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Get user details
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const request = {
      order_amount: totalAmount,
      order_currency: "INR",
      order_id: "cf_" + orderId,
      customer_details: {
        customer_id: req.user.id,
        customer_phone: order.deliveryAddress.phone,
        customer_name: user.name || order.deliveryAddress.fullName,
        customer_email: user.email
      },
      order_meta: {
        return_url: "http://localhost:3000/payment?order_id={order_id}"
      }
    };

    const response = await Cashfree.PGCreateOrder("2025-01-01", request);
    console.log('Cashfree order created:', response.data.cf_order_id);

    res.json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      cf_order_id: response.data.cf_order_id
    });
  } catch (error) {
    console.error('Cashfree create order error:', error?.response?.data || error);
    res.status(500).json({ success: false, message: 'Failed to create payment session' });
  }
});

// Verify Cashfree Payment
app.post('/verify-payment', fetchUser, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const cfOrderId = "cf_" + orderId;

    const response = await Cashfree.PGOrderFetchPayments("2025-01-01", cfOrderId);
    const payments = response.data;

    if (payments && payments.length > 0) {
      const latestPayment = payments[payments.length - 1];

      if (latestPayment.payment_status === 'SUCCESS') {
        await Order.findByIdAndUpdate(orderId, { status: 'Paid' });
        console.log('Payment verified and order updated:', orderId);
        return res.json({ success: true, status: 'SUCCESS', paymentDetails: latestPayment });
      } else {
        return res.json({ success: false, status: latestPayment.payment_status, paymentDetails: latestPayment });
      }
    }

    res.json({ success: false, status: 'NO_PAYMENTS', message: 'No payments found for this order' });
  } catch (error) {
    console.error('Payment verification error:', error?.response?.data || error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
});

// Start Server
app.listen(port, (error) => {
  if (!error) {
    console.log(`Server running on http://localhost:${port}`);
  } else {
    console.log("Error starting server:", error);
  }
});