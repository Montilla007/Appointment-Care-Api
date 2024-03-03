require('dotenv').config();

const { initializeApp, getApp } = require("firebase/app");
const { getStorage, ref, uploadBytes } = require("firebase/storage");
const multer = require("multer");
const { StatusCodes } = require("http-status-codes");
const path = require("path"); // Import the path module

// Rest of your middleware code...


// Check if Firebase app is already initialized
let firebaseApp;
try {
  firebaseApp = getApp();
} catch (error) {
  const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
  };
  firebaseApp = initializeApp(firebaseConfig);
}

const storage = getStorage(firebaseApp);

// Multer configuration for handling image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single("image");

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images only"));
  }
}

// Function to upload image to Firebase Storage
async function uploadImageToStorage(file) {
  const storageRef = ref(storage, `images/${file.originalname}`);
  await uploadBytes(storageRef, file.buffer);
  const imageUrl = `https://storage.googleapis.com/${storage.bucket}/images/${file.originalname}`;
  return imageUrl;
}

// Middleware function to handle image uploads and save image URL to req.imageURL
function uploadImage(req, res, next) {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Multer error: " + err.message });
    } else if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error uploading image: " + err.message });
    }
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "No image uploaded" });
    }

    try {
      const imageUrl = await uploadImageToStorage(req.file);
      req.imageURL = imageUrl; // Save the image URL in the request object
      next(); // Call the next middleware or route handler
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error uploading image to Firebase Storage: " + error.message });
    }
  });
}

module.exports = uploadImage;
