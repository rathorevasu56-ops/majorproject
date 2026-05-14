const express = require("express");
const axios = require("axios");
const multer = require("multer");

const { storage } = require("../cloudConfig");

const upload = multer({ storage });

const router = express.Router();

const Listing = require("../modules/listing");

const wrapAsync = require("../utils/wrapAsync");

const listingController = require("../controllers/listing");

const {
  isLoggedIn,
  isOwner,
} = require("../middleware");

const { listingSchema } = require("../utils/schema");

const ExpressError = require("../utils/ExpressError");

// VALIDATION MIDDLEWARE
const validateListing = (req, res, next) => {

  let { error } = listingSchema.validate(req.body);

  if (error) {

    let errMsg = error.details
      .map(el => el.message)
      .join(",");

    throw new ExpressError(400, errMsg);

  }

  next();

};

// ================= INDEX =================

router.get(
  "/",
  wrapAsync(async (req, res) => {

    const {
      category,
      location,
    } = req.query;

    let filter = {};

    // CATEGORY FILTER
    if (category) {

      filter.category = category;

    }

    // LOCATION FILTER
    if (location) {

      filter.location = new RegExp(
        location,
        "i"
      );

    }

    const allListings = await Listing.find(filter)
      .populate("owner");

    res.render("listings/index", {

      allListings,

      activeCategory: category || "",

    });

  })
);

// ================= SEARCH =================

router.get(
  "/search",
  wrapAsync(async (req, res) => {

    const searchQuery = req.query.q;

    const allListings = await Listing.find({

      $or: [

        {
          title: {
            $regex: searchQuery,
            $options: "i",
          },
        },

        {
          location: {
            $regex: searchQuery,
            $options: "i",
          },
        },

        {
          country: {
            $regex: searchQuery,
            $options: "i",
          },
        },

        {
          category: {
            $regex: searchQuery,
            $options: "i",
          },
        },

      ],

    }).populate("owner");

    res.render("listings/index", {

      allListings,

      activeCategory: "",

    });

  })
);

// ================= NEW =================

router.get(
  "/new",
  isLoggedIn,
  listingController.renderNewForm
);

// ================= SHOW =================

router.get(
  "/:id",
  wrapAsync(listingController.showListing)
);

// ================= CREATE =================

router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);

// ================= EDIT =================

router.get(
  "/:id/edit",
  isLoggedIn,
  
  wrapAsync(listingController.renderEditForm)
);

// ================= UPDATE =================

router.put(
  "/:id",
  isLoggedIn,
  
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
);

// ================= DELETE =================

router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
);

module.exports = router;