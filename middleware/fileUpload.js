require('dotenv').config();

const { initializeApp, getApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
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
const multerConfig = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
})
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

// Middleware function to handle image uploads and save image URL to req.imageURL
const uploadSingleImage = multerConfig.single("image");

function uploadImage(req, res, next) {
    uploadSingleImage(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Multer error: " + err.message });
        } else if (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error uploading image: " + err.message });
        }
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "No image uploaded" });
        }
        try {
            const imageURL = await uploadImageToStorage(req.file);
            req.imageURL = imageURL; // Save the image URL in the request object
            next(); // Call the next middleware or route handler
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error uploading image to Firebase Storage: " + error.message });
        }
    });
}

// Middleware function to handle image uploads and save image URL to req.licenseURL
const uploadLicensesImage = multerConfig.single("licensePicture");
function uploadLicense(req, res, next) {
    uploadLicensesImage(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Multer error: " + err.message });
        } else if (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error uploading image: " + err.message });
        }
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "No image uploaded" });
        }
        try {
            const licenseURL = await uploadImageToStorage(req.file);
            req.licensePictureURL  = licenseURL; // Save the image URL in the request object
            next(); // Call the next middleware or route handler
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error uploading image to Firebase Storage: " + error.message });
        }
    });
}


module.exports = uploadImage, uploadLicense;
