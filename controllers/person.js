const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')

const users = async (req, res) => {
  try {
    const people = await User.find({});
    res.status(StatusCodes.OK).json(people);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
  }
}
const usersId = async (req, res) => {
  try {
    const userId = req.params.id; // Accessing the route parameter (ObjectId)
    const user = await User.findById(userId); // Fetching user detail by ObjectId
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }
    res.status(StatusCodes.OK).json(user);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
}
const usersUpdate = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
    if (!user) {
      // If user is not found, return a 404 error
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }
    // If user is updated successfully, send the updated user as a response
    res.status(StatusCodes.OK).json({ user });
  } catch (err) {
    // Handle errors
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};
const usersDelete = async (req, res) => {
  try {
    const userId = req.params.id;

    // Assuming you have a User model with a deleteOne method
    const deletedUser = await User.deleteOne({ _id: userId });

    if (deletedUser.deletedCount === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }

    res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
}
const changePassword = async (req, res) => {
  const userId = req.params.id; // Extract user ID from request parameters
  const { currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

  try {
    // Check if current password matches the password stored in the database
    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError('Invalid current password');
    }

    // const salt = await bcrypt.genSalt(10); // Use await here to ensure the salt is generated synchronously
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Use await to hash the password

    console.log(hashedPassword);

    // Update the user's password in the database
    const updatedPassword = await User.findOneAndUpdate(
      { _id: userId },
      { password: hashedPassword },
      { new: true } // To return the updated document
    );
    if (!updatedPassword) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No schedules found' });
    }
    console.log('hashedPassword', hashedPassword)
    console.log(user.password);
    // Respond with success message and token
    res.status(StatusCodes.OK).json({ message: 'Password changed successfully' });
  } catch (error) {
    // Handle errors
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getImage = async (req, res) => {
  try {
    const imageId = req.params.id;

    // Find the document containing the image URL by its ID
    const user = await User.findById(imageId);

    if (!user || !user.imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Send the image URL as the response
    res.status(200).json({ imageURL: user.imageData });
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getLicense = async (req, res) => {
  try {
    const imageId = req.params.id;

    // Find the document containing the image URL by its ID
    const user = await User.findById(imageId);

    if (!user || !user.imageLicense) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Send the image URL as the response
    res.status(200).json({ imageURL: user.imageLicense });
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = {
  users, usersId, usersUpdate, usersDelete, changePassword, getImage, getLicense

}
