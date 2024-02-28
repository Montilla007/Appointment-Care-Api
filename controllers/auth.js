const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const upload = require('../middleware/fileUpload'); // Import multer middleware
const register = async (req, res) => {
  try {
    // Add multer middleware here for handling image upload
    // upload.single('image')(req, res, async (err) => {
    //   // Handle image upload errors
    //   if (err) {
    //     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Image upload failed', error: err.message });
    //   }

      // Get user data from the request body
      const userData = req.body;

      // Add the path of the uploaded image to the user data
      // userData.imageData = req.file ? req.file.path : null;

      // Create the user
      const user = await User.create(userData);

      // Generate JWT token
      const token = user.createJWT();

      // Send response
      res.status(StatusCodes.CREATED).json({ user: { name: user.Fname }, role: { role: user.role}, token });
    });
  } catch (err) {
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