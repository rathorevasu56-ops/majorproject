const Listing = require("./modules/listing");
const Review = require("./modules/review");

// ================= LOGIN CHECK =================
module.exports.isLoggedIn = (req, res, next) => {

  if (!req.isAuthenticated()) {

    req.session.redirectUrl = req.originalUrl;

    req.flash("error", "You must be logged in first!");

    return res.redirect("/login");
  }

  next();
};

// ================= SAVE REDIRECT URL =================
module.exports.saveRedirectUrl = (req, res, next) => {

  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }

  next();
};

// ================= OWNER AUTHORIZATION =================
module.exports.isOwner = async (req, res, next) => {

  const { id } = req.params;

  const listing = await Listing.findById(id);

  // listing not found
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // old listings without owner
  if (!listing.owner) {
    req.flash("error", "You are not the owner!");
    return res.redirect(`/listings/${id}`);
  }

  // owner check
  if (!listing.owner.equals(req.user._id)) {

    req.flash("error", "You are not the owner!");

    return res.redirect(`/listings/${id}`);
  }

  next();
};
module.exports.isReviewAuthor = async (req, res, next) => {

  const { reviewId, id } = req.params;

  const review = await Review.findById(reviewId);

  // review not found
  if (!review) {

    req.flash("error", "Review not found!");

    return res.redirect(`/listings/${id}`);
  }

  // old reviews without author
  if (!review.author) {

    req.flash("error", "You are not the author of this review");

    return res.redirect(`/listings/${id}`);
  }

  // authorization check
  if (!review.author.equals(req.user._id)) {

    req.flash("error", "You are not the author of this review!");

    return res.redirect(`/listings/${id}`);
  }

  next();
};