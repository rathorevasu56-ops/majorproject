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


// ================= DATABASE URL =================

const dbUrl = process.env.atlasdb_url;


// ================= MONGODB CONNECTION =================

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log("❌ DB Error:", err);
  });


// ================= VIEW ENGINE =================

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));


// ================= MIDDLEWARE =================

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
  console.log("SESSION STORE ERROR", err);
});


// ================= SESSION CONFIG =================

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));

app.use(flash());


// ================= PASSPORT =================

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


// ================= LOCALS =================

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

  let { error } = listingSchema.validate(req.body);

  if (error) {

    let errMsg = error.details.map((el) => el.message).join(",");

    throw new ExpressError(400, errMsg);

  } else {

    next();
  }
};


// ================= HOME =================

app.get("/", (req, res) => {
  res.send("hi vasu whatsapp");
});


// ================= SIGNUP =================

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

        req.flash("success", "Welcome to Airbnb!");

        res.redirect("/listings");
      });

    } catch (err) {

      req.flash("error", err.message);

      res.redirect("/signup");
    }
  })
);


// ================= LOGIN =================

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

    req.flash("success", "Welcome back!");

    let redirectUrl = res.locals.redirectUrl || "/listings";

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

    req.flash("success", "Logged out successfully!");

    res.redirect("/listings");
  });
});


// ================= REVIEW CREATE =================

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

    req.flash("success", "Review added successfully!");

    res.redirect(`/listings/${listing._id}`);
  })
);


// ================= REVIEW DELETE =================

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


// ================= 404 =================

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});


// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {

  let { statusCode = 500, message = "Something went wrong!" } = err;

  console.log(err);

  res.status(statusCode).send(message);
});


// ================= SERVER =================

app.listen(8080, () => {
  console.log("🚀 Server running on http://localhost:8080");
});