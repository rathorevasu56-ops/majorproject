const Listing = require("../modules/listing");
const fetchImage = require("../utils/fetchimage");
const axios = require("axios");

// INDEX
module.exports.index = async (req, res) => {

  const allListings = await Listing.find()
    .populate("owner");

  res.render("listings/index", {
    allListings,
  });

};

// NEW FORM
module.exports.renderNewForm = (req, res) => {

  res.render("listings/new.ejs");

};

// SHOW
module.exports.showListing = async (req, res) => {

  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {

    req.flash("error", "Listing not found!");

    return res.redirect("/listings");

  }

  res.render("listings/show", {
    listing,
  });

};

// CREATE
module.exports.createListing = async (req, res) => {

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;

  // IMAGE
  if (req.file) {

    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };

  }

  // LOCATION GEOCODING
  try {

    const locationQuery = `${newListing.location}, ${newListing.country}`;

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: locationQuery,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "airbnb-clone",
        },
      }
    );

    // If location found
    if (response.data.length > 0) {

      newListing.geometry = {

        lat: parseFloat(response.data[0].lat),

        lng: parseFloat(response.data[0].lon),

      };

    } else {

      // Default Delhi Coordinates
      newListing.geometry = {
        lat: 28.6139,
        lng: 77.2090,
      };

    }

  } catch (err) {

    console.log("Geocoding Error:", err);

    // Fallback Coordinates
    newListing.geometry = {
      lat: 28.6139,
      lng: 77.2090,
    };

  }

  // SAVE
  await newListing.save();

  req.flash("success", "New listing created!");

  res.redirect("/listings");

};

// EDIT FORM
module.exports.renderEditForm = async (req, res) => {

  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {

    req.flash("error", "Listing not found!");

    return res.redirect("/listings");

  }

  res.render("listings/edit.ejs", {
    listing,
  });

};

// UPDATE
module.exports.updateListing = async (req, res) => {

  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {

    req.flash("error", "Listing not found!");

    return res.redirect("/listings");

  }

  // UPDATE BASIC DATA
  Object.assign(listing, req.body.listing);

  // UPDATE IMAGE
  if (req.file) {

    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };

  }

  // UPDATE LOCATION GEOCODING
  try {

    const locationQuery = `${listing.location}, ${listing.country}`;

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: locationQuery,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "airbnb-clone",
        },
      }
    );

    if (response.data.length > 0) {

      listing.geometry = {

        lat: parseFloat(response.data[0].lat),

        lng: parseFloat(response.data[0].lon),

      };

    }

  } catch (err) {

    console.log("Geocoding Update Error:", err);

  }

  await listing.save();

  req.flash("success", "Listing updated!");

  res.redirect(`/listings/${id}`);

};

// DELETE
module.exports.destroyListing = async (req, res) => {

  const { id } = req.params;

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted!");

  res.redirect("/listings");

};