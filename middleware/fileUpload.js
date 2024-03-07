const { StatusCodes } = require("http-status-codes");
const multer = require("multer");
const path = require("path");
const { getStorage, ref, uploadBytes, getDownloadURL  } = require("firebase/storage");

// Initialize Firebase app and storage
const { initializeApp, getApp } = require("firebase/app");
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
};
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// Multer configuration for handling image uploads
const multerConfig = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

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

// Middleware function to handle profile picture upload and save the URL to req.profilePictureURL
const uploadProfilePicture = multerConfig.single("profilePicture");
const handleProfilePictureUpload = (req, res, next) => {
    uploadProfilePicture(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Profile picture upload failed: " + err.message });
        } else if (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error uploading profile picture: " + err.message });
        }
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "No profile picture uploaded" });
        }

        try {
            const profilePictureURL = await uploadImageToStorage(req.file);
            req.profilePictureURL = profilePictureURL; // Save the profile picture URL in the request object
            next(); // Call the next middleware or route handler
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error uploading profile picture to Firebase Storage: " + error.message });
        }
    });
};

// Middleware function to handle license picture upload and save the URL to req.licensePictureURL
const uploadLicensePicture = multerConfig.single("licensePicture");
const handleLicensePictureUpload = (req, res, next) => {
    uploadLicensePicture(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "License picture upload failed: " + err.message });
        } else if (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error uploading license picture: " + err.message });
        }
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "No license picture uploaded" });
        }

        try {
            const licensePictureURL = await uploadImageToStorage(req.file);
            req.licensePictureURL = licensePictureURL; // Save the license picture URL in the request object
            next(); // Call the next middleware or route handler
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error uploading license picture to Firebase Storage: " + error.message });
        }
    });
};

module.exports = { handleProfilePictureUpload, handleLicensePictureUpload };
