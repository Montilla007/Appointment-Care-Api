const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const uploadImage = require('../middleware/fileUpload'); // Import multer middleware

const register = async (req, res) => {
  try {
    // Check if an image was uploaded
    const hasImage = req.file && req.file.originalname;

    // If there's no image uploaded, set imageURL to null
    const imageURL = hasImage ? await uploadImageToStorage(req.file) : null;

    // Remove imageURL from req.body
    const { ...userData } = req.body;

    // Add imageURL to user data if it exists
    const userDataWithImage = hasImage ? { ...userData, imageURL } : userData;

    // Create the user
    const user = await User.create(userDataWithImage);

    // Generate JWT token
    const token = user.createJWT();

    // Send response
    res.status(StatusCodes.CREATED).json({ user: { name: user.Fname }, role: { role: user.role}, token });
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
  res.status(StatusCodes.OK).json({user: user, token})// must change to { user: { name: user.Fname }, token }
}

module.exports = {
  register,
  login,
}