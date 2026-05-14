const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../modules/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const initDB = async () => {
  await mongoose.connect(MONGO_URL);  // ✅ connect first
  console.log("✅ MongoDB Connected");

  await Listing.deleteMany({});
  console.log("🗑️ Old data cleared");

  await Listing.insertMany(initData.data);
  console.log("✅ Data seeded successfully");

  await mongoose.connection.close();  // ✅ close after done
  console.log("🔌 Connection closed");
};

initDB().catch((err) => console.log("❌ Error:", err));