const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const uploadProfilePicture = require('../middleware/fileUpload').handleProfilePictureUpload;
const uploadLicensePicture = require('../middleware/fileUpload').handleLicensePictureUpload;


const register = async (req, res) => {
  try {
      // Extract user data from request body
      const { role, fullName, email, ...otherUserData } = req.body;

      // Check if the user is a Doctor
      if (role === 'Doctor') {
          // Upload the profile picture and license picture using the middleware
          uploadProfilePicture(req, res, async function(err) {
              if (err) {
                  return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Profile picture upload failed', error: err.message });
              }

              uploadLicensePicture(req, res, async function(err) {
                  if (err) {
                      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'License picture upload failed', error: err.message });
                  }

                  // Check if profile picture and license picture were uploaded successfully
                  const imageData = req.profilePictureURL || null; // imageData
                  const imageLicense = req.licensePictureURL || null; //imageLicense

                  // Create the user with profile and license picture URLs
                  const user = await User.create({
                      role,
                      fullName,
                      email,
                      imageData,
                      imageLicense,
                      ...otherUserData
                  });

                  // Generate JWT token
                  const token = user.createJWT();

                  // Send response with user details and token
                  res.status(StatusCodes.CREATED).json({ user: { role, fullName, email, profilePictureURL: imageData, licensePictureURL }, token });
              });
          });
      } else {
          // If the user is not a Doctor, skip license picture upload
          // Upload only the profile picture
          uploadProfilePicture(req, res, async function(err) {
              if (err) {
                  return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Profile picture upload failed', error: err.message });
              }

              // Check if profile picture was uploaded successfully
              const imageData = req.profilePictureURL || null;

              // Create the user with only the profile picture URL
              const user = await User.create({
                  role,
                  fullName,
                  email,
                  imageData,
                  ...otherUserData
              });

              // Generate JWT token
              const token = user.createJWT();

              // Send response with user details and token
              res.status(StatusCodes.CREATED).json({ user: { role, fullName, email, profilePictureURL }, token });
          });
      }
  } catch (error) {
      // Handle database or server errors
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Registration failed', error: error.message });
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