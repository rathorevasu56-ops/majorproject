const cloudinary = require("cloudinary").v2;

const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: "dqhi74lec",
  api_key: "593234551512544",
  api_secret: "zFQtXOShTVE64sM93fHJ7npCAKg",
});

const storage = new CloudinaryStorage({

  cloudinary,

  params: {

    folder: "wanderlust_DEV",

    allowed_formats: ["png", "jpg", "jpeg"],

  },

});

module.exports = {
  cloudinary,
  storage,
};