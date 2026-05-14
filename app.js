if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const listingRouter = require("./routes/listing");

const Listing = require("./modules/listing");
const Review = require("./modules/review");
const User = require("./modules/user");

const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

const { listingSchema } = require("./utils/schema");

const {
  isLoggedIn,
  saveRedirectUrl,
  isReviewAuthor,
} = require("./middleware");

const app = express();


// ================= DATABASE CONNECTION =================

const dbUrl = process.env.ATLASDB_URL;

async function connectDB() {
  try {

    await mongoose.connect(dbUrl);

    console.log("✅ MongoDB Atlas Connected");

  } catch (err) {

    console.log("❌ Database Connection Error");

    console.log(err);
  }
}

connectDB();


// ================= VIEW ENGINE =================

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));


// ================= EXPRESS MIDDLEWARE =================

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));


// ================= SESSION STORE =================

const store = MongoStore.create({
  mongoUrl: dbUrl,

  crypto: {
    secret: process.env.SECRET,
  },

  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("❌ Session Store Error", err);
});


// ================= SESSION CONFIG =================

const sessionOptions = {
  store,

  secret: process.env.SECRET,

  resave: false,

  saveUninitialized: false,

  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,

    maxAge: 7 * 24 * 60 * 60 * 1000,

    httpOnly: true,
  },
};

app.use(session(sessionOptions));

app.use(flash());


// ================= PASSPORT CONFIG =================

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


// ================= GLOBAL LOCALS =================

app.use((req, res, next) => {

  res.locals.success = req.flash("success");

  res.locals.error = req.flash("error");

  res.locals.currUser = req.user;

  res.locals.activeCategory = "";

  next();
});


// ================= ROUTES =================

app.use("/listings", listingRouter);


// ================= VALIDATION MIDDLEWARE =================

const validateListing = (req, res, next) => {

  const { error } = listingSchema.validate(req.body);

  if (error) {

    const errMsg = error.details.map((el) => el.message).join(",");

    throw new ExpressError(400, errMsg);
  }

  next();
};


// ================= HOME ROUTE =================

app.get("/", (req, res) => {
  res.redirect("/listings");
});


// ================= SIGNUP ROUTES =================

app.get("/signup", (req, res) => {
  res.render("listings/users/signup");
});

app.post(
  "/signup",

  wrapAsync(async (req, res, next) => {

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

        req.flash("success", "Welcome to Wanderlust!");

        res.redirect("/listings");
      });

    } catch (err) {

      req.flash("error", err.message);

      res.redirect("/signup");
    }
  })
);


// ================= LOGIN ROUTES =================

app.get("/login", (req, res) => {
  res.render("listings/login");
});

app.post(
  "/login",

  saveRedirectUrl,

  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),

  (req, res) => {

    req.flash("success", "Welcome Back!");

    const redirectUrl = res.locals.redirectUrl || "/listings";

    delete req.session.redirectUrl;

    res.redirect(redirectUrl);
  }
);


// ================= LOGOUT =================

app.get("/logout", (req, res, next) => {

  req.logout((err) => {

    if (err) {
      return next(err);
    }

    req.flash("success", "Logged Out Successfully!");

    res.redirect("/listings");
  });
});


// ================= CREATE REVIEW =================

app.post(
  "/listings/:id/reviews",

  isLoggedIn,

  wrapAsync(async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    const newReview = new Review(req.body.review);

    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();

    await listing.save();

    req.flash("success", "Review Added Successfully!");

    res.redirect(`/listings/${listing._id}`);
  })
);


// ================= DELETE REVIEW =================

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

    req.flash("success", "Review Deleted Successfully!");

    res.redirect(`/listings/${id}`);
  })
);


// ================= 404 HANDLER =================

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});


// ================= GLOBAL ERROR HANDLER =================

app.use((err, req, res, next) => {

  let { statusCode = 500, message = "Something Went Wrong" } = err;

  console.log(err);

  res.status(statusCode).send(message);
});


// ================= SERVER =================

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`🚀 Server Running On Port ${port}`);
});