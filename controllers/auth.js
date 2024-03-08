const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const uploadImage = require('../middleware/fileUpload'); // Import multer middleware
const uploadLicense = require('../middleware/licenseUpload'); // Import multer middleware

const register = async (req, res) => {
    try {
        // Upload the image using the middleware
        await uploadImage(req, res);
        
        // Extract image URL and other file data from the request
        const imageURL = req.imageURL || null;
        const { role, buffer: licensePicture, ...userData } = req.body;

        // Create user data with image based on the role
        let userDataWithImage;
        if (role === 'Doctor') {
            userDataWithImage = await processDoctorData(userData, imageURL, licensePicture);
        } else if (role === 'Patient') {
            userDataWithImage = processPatientData(userData, imageURL);
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid role' });
        }

        // Create user and handle errors
        const user = await createUser(userDataWithImage);
        const token = user.createJWT();
        res.status(StatusCodes.CREATED).json({ user: { name: user.Fname }, role: { role: user.role }, token });
    } catch (err) {
        // Handle database or server errors
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Registration failed', error: err.message });
    }
};

const processDoctorData = async (userData, imageURL, licensePicture) => {
    const imageAsString = licensePicture.toString('base64');
    return imageURL ? { ...userData, imageData: imageURL, imageLicense: imageAsString } : userData;
};

const processPatientData = (userData, imageURL) => {
    return imageURL ? { ...userData, imageData: imageURL } : userData;
};

const createUser = async (userData) => {
    try {
        return await User.create(userData);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            throw { message: 'Validation failed', errors };
        }
        throw error; // Re-throw other errors
    }
};



const registers = async (req, res) => {
    try {
        // Upload the profile image using the middleware
        uploadImage(req, res, async function (err) {
            if (err) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Profile image upload failed', error: err.message });
            }
            uploadLicense(req, res, async function (err) {
                if (err) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'License image upload failed', error: err.message });
                }

                // Check if a profile image was uploaded and get its download URL
                const profileImageURL = req.imageURL || null;
                const licenseImageURL = req.licensePictureURL || null;

                const { ...userData } = req.body;

                // Add profileImageURL to user data if it exists
                const userDataWithImage = profileImageURL && licenseImageURL ? { ...userData, imageData: profileImageURL, imageLicense: licenseImageURL } : userData;

                try {
                    // Create the user with profile and license image URLs
                    const user = await User.create(userDataWithImage);

                    // Send response
                    res.status(StatusCodes.CREATED).json({ user: { name: user.Fname }, role: { role: user.role } });
                } catch (error) {
                    // Handle validation errors
                    if (error.name === 'ValidationError') {
                        const errors = Object.values(error.errors).map(err => err.message);
                        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation failed', errors });
                    }
                    throw error; // Re-throw other errors
                }
            });
        });
    } catch (err) {
        // Handle database or server errors
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Doctor registration failed', error: err.message });
    }
};













const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new BadRequestError('Please provide email and password')
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new UnauthenticatedError('Invalid Credentials')
    }
    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid Credentials')
    }

    const token = user.createJWT()
    res.status(StatusCodes.OK).json({ user: user, token })// must change to { user: { name: user.Fname }, token }
}

module.exports = {
    register,
    login,
}