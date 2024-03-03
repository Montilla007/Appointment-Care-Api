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

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();

        // Generate a new JWT token with updated user information (optional)
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET);

        // Respond with success message and token
        res.status(StatusCodes.OK).json({ message: 'Password changed successfully', token });
    } catch (error) {
        // Handle errors
        res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

module.exports = {
    users, usersId, usersUpdate, usersDelete, changePassword

}
