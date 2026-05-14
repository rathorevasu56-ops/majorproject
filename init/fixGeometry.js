const mongoose = require("mongoose");
const axios = require("axios");

const Listing = require("../modules/listing");

main()
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

async function updateListings() {

  const listings = await Listing.find({});

  for (let listing of listings) {

    // Skip if geometry already exists
    if (
      listing.geometry &&
      listing.geometry.lat &&
      listing.geometry.lng
    ) {
      continue;
    }

    try {

      const query =
        `${listing.location}, ${listing.country}`;

      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: query,
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

      } else {

        // Default Delhi
        listing.geometry = {
          lat: 28.6139,
          lng: 77.2090,
        };

      }

      await listing.save();

      console.log(
        `Updated: ${listing.title}`
      );

    } catch (err) {

      console.log(
        `Error updating ${listing.title}`
      );

    }

  }

  console.log("All Listings Updated");

  mongoose.connection.close();

}

updateListings();