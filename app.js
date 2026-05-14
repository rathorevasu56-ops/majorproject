if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const listingRouter = require("./routes/listing");
const Listing = require("./modules/listing");
const fetchImage = require("./utils/fetchimage.js");  // ✅ import it
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const {
  isLoggedIn,
  saveRedirectUrl,
  isOwner,
  isReviewAuthor
} = require("./middleware.js");


const app = express();


const Review = require("./modules/review.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./utils/schema.js");
const passport = require("passport");
const User = require("./modules/user");
const LocalStrategy = require("passport-local").Strategy;

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const store = MongoStore.create({
  mongoUrl: "mongodb://127.0.0.1:27017/wanderlust"
});

app.use(session({
  store,
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  // Add this line
  res.locals.currUser = req.user;

  next();
});
app.use((req, res, next) => {

  res.locals.activeCategory = "";

  next();

});

app.use("/listings", listingRouter);

// 🔌 MongoDB Connection
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

main()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// Validation Middleware
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
app.get("/signup", (req, res) => {
  res.render("listings/users/signup");
});



app.post("/signup", wrapAsync(async (req, res, next) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    const newUser = new User({
      email,
      firstName,
      lastName,
    });

    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }

      req.flash("success", "Welcome to Airbnb!");
      res.redirect("/listings");
    });

  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
}));


//middleware
// ================= SAVE REDIRECT URL =================


module.exports.isOwner = async (req, res, next) => {

  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing.owner.equals(req.user._id)) {

    req.flash("error", "You are not the owner of this listing!");

    return res.redirect(`/listings/${id}`);
  }

  next();
};

// ================= LOGIN CHECK MIDDLEWARE =================


module.exports = {
  isLoggedIn,
  saveRedirectUrl,
};
// ================= LOGIN ROUTES =================

// GET Login Form
app.get("/login", (req, res) => {
  res.render("listings/login");
});

// POST Login
app.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {

    req.flash("success", "Welcome back!");

    let redirectUrl = res.locals.redirectUrl || "/listings";

    delete req.session.redirectUrl;

    res.redirect(redirectUrl);
  }
);
// LOGOUT
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
});

// Home
app.get("/", (req, res) => {
  res.send("hi vasu whatapp");
});

// REVIEW CREATE
app.post(
  "/listings/:id/reviews",
  isLoggedIn,
  wrapAsync(async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    const newReview = new Review(req.body.review);

    // ADD THIS
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "Review added successfully!");

    res.redirect(`/listings/${listing._id}`);
  })
);
// REVIEW DELETE
app.delete(
  "/listings/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {

    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");

    res.redirect(`/listings/${id}`);
  })
);
// 404
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error Handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;

  console.log(err);

  res.status(statusCode).send(message);
});

// 🚀 Start Server
app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});