const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Connect to your database
mongoose.connect("mongodb+srv://shival:shivangi20@cluster20.tkkat9n.mongodb.net/e-commerce")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// Import your Product schema - use the same schema as your main app
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
}, 'products'); // explicitly name the collection to match your main app

// Folder where images are stored
const imagesDir = path.join(__dirname, "upload", "images");

// Read all filenames
const files = fs.readdirSync(imagesDir);

// Function to generate random prices
const randomPrice = () => Math.floor(Math.random() * 5000) + 500;

// Create images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  console.log("📁 Creating images directory...");
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to get the next available ID
const getNextId = async () => {
  const lastProduct = await Product.findOne().sort({ id: -1 });
  return lastProduct ? lastProduct.id + 1 : 1;
};

// Function to insert data
const insertProducts = async () => {
  try {
    console.log("🔍 Reading image files...");
    let products = [];
    let startId = await getNextId();

    if (files.length === 0) {
      console.log("❌ No files found in the images directory");
      return;
    }

    for (const file of files) {
      if (file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg")) {
        const name = file.split(".")[0].replace(/_/g, " ").replace(/([A-Z])/g, " $1").trim();
        
        products.push({
          id: startId++,
          name: name,
          image: `http://localhost:4000/images/${file}`,
          category: "general", // defaults to general, can be updated later
          new_price: randomPrice(),
          old_price: randomPrice() + 1000,
          available: true
        });
      }
    }

    if (products.length === 0) {
      console.log("❌ No valid image files found");
      return;
    }

    console.log(`📝 Adding ${products.length} products to database...`);
    await Product.insertMany(products);
    console.log("✅ Products added successfully!");
  } catch (error) {
    console.error("❌ Error adding products:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Database connection closed");
  }
};

// Run the seeder
console.log("🌱 Starting product seeder...");
insertProducts();
