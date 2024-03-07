const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const { uploadImage, uploadLicense } = require('../middleware/fileUpload'); // Import multer middleware

const register = async (req, res) => {
  try {
    // Extracting role from the request body
    const { role, ...userData } = req.body;
    console.log(role);
    // Check if the role is Doctor or Patient
    if (role === "Doctor") {
      // For Doctor, upload the image and license using the middleware
      uploadImage(req, res, async function (err) {
        if (err) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Image upload failed', error: err.message });
        }

        uploadLicense(req, res, async function (err) {
          if (err) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'License upload failed', error: err.message });
          }

          // Check if an image and license were uploaded and get their download URLs
          const imageURL = req.imageURL || null;
          const licenseURL = req.licensePictureURL  || null;

          // Add imageURL to user data if it exists
          const userDataWithImage = (imageURL && licenseURL) ? { ...userData, imageData: imageURL, imageLicense: licenseURL } : userData;

          try {
            // Create the doctor user with image and license data if available
            const user = await User.create(userDataWithImage);

            // Generate JWT token
            const token = user.createJWT();

            // Send response
            res.status(StatusCodes.CREATED).json({ user: { name: user.Fname }, role: { role: user.role }, token });
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
    } else if (role === 'Patient') {
      // For Patient, proceed without image upload
      try {
        // Create the patient user without image data
        const user = await User.create(userData);

        // Generate JWT token
        const token = user.createJWT();

        // Send response
        res.status(StatusCodes.CREATED).json({ user: { name: user.Fname }, role: { role: user.role }, token });
      } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map(err => err.message);
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation failed', errors });
        }
        throw error; // Re-throw other errors
      }
    } else {
      // Invalid role
      return res.status(StatusCodes.BAD_REQUEST).json({ message: `Invalid role: ${role}` });

    }
  } catch (err) {
    // Handle database or server errors
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Registration failed', error: err.message });
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