const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    // Host-specific fields
    isHost: {
      type: Boolean,
      default: false,
    },
    hostSince: {
      type: Date,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    // Listings this user owns (as host)
    listings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
    // Reviews written by this user
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    // Bookings made by this user (as guest)
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    // Wishlist / saved listings
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
    phoneNumber: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

// passport-local-mongoose adds:
//   - username field (default: "username", here we override to "email" if desired)
//   - hash & salt fields for password storage
//   - static methods: register(), authenticate(), serializeUser(), deserializeUser()
//   - instance methods: setPassword(), changePassword(), authenticate()
UserSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  errorMessages: {
    MissingPasswordError: "No password was given",
    AttemptTooSoonError: "Account is currently locked. Try again later",
    TooManyAttemptsError:
      "Account locked due to too many failed login attempts",
    NoSaltValueStoredError: "Authentication not possible — no salt stored",
    IncorrectPasswordError: "Password or username is incorrect",
    IncorrectUsernameError: "Password or username is incorrect",
    MissingUsernameError: "No username was given",
    UserExistsError: "A user with the given username is already registered",
  },
});

module.exports = mongoose.model("User", UserSchema);