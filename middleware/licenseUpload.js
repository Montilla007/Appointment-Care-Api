const { getDownloadURL, ref, uploadBytes } = require("firebase/storage");
const { StatusCodes } = require("http-status-codes");
const multer = require("multer");
const path = require("path");
const { initializeApp, getApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");

// Initialize Firebase app
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

// Get Firebase storage instance
const storage = getStorage(firebaseApp);

// Multer configuration
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single("licensePicture");

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

// Function to upload image to Firebase Storage and get the download URL
async function uploadImageToStorage(file) {
    const storageRef = ref(storage, `images/${file.originalname}`);
    await uploadBytes(storageRef, file.buffer);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}

// Middleware function to handle image uploads and save image URL to req.licensePictureURL
function uploadLicense(req, res, next) {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Multer error1: " + err.message });
        } else if (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error uploading image1: " + err.message });
        }
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "No image uploaded" });
        }
        try {
            const licenseURL = await uploadImageToStorage(req.file);
            req.licensePictureURL = licenseURL; // Save the image URL in the request object
            console.log(licenseURL);
            next(); // Call the next middleware or route handler
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error uploading image to Firebase Storage: " + error.message });
        }
    });
}

module.exports = uploadLicense;
