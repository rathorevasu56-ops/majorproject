
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  description: {
    type: String,
    required: true,
  },

  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    },
  },

  location: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  country: {
    type: String,
    required: true,
    default: "India",
  },

  // ✅ CATEGORY — matches navbar category bar
  category: {
    type: String,
    enum: [
      "Beachfront",
      "Cabins",
      "Mountains",
      "Castles",
      "Amazing pools",
      "Camping",
      "Arctic",
      "Luxe",
      "Countryside",
      "Lake front",
      "Boats",
      "Trending",
      "Tropical",
      "City stays",
    ],
    default: "Trending",
  },

  // GEOLOCATION
  geometry: {
    lat: {
      type: Number,
      default: 28.6139,
    },
    lng: {
      type: Number,
      default: 77.2090,
    },
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

}, { timestamps: true });

const Listing = mongoose.model("List", listingSchema);
module.exports = Listing;