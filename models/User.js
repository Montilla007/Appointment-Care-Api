const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
  
  task: {
    type: String,
    required: [true, 'Please provide task'],
    enum: ['Doctor', 'Patient'],
  },
  Fname: {
    type: String,
    required: [true, 'Please provide first name'],
    minLength: 3,
    maxLength: 50,
  },
  Lname: {
    type: String,
    required: [true, 'Please provide last name'],
    minLength: 3,
    maxLength: 50,
  },
  number: {
    type: String,
    required: [true, 'Please provide number'],
    maxLength: 12,
  },
  gender: {
    type: String,
    required: [true, 'Please provide gender'],
    enum: ['Male', 'Female'],
  },
  age: {
    type: Number,
    required: [true, 'Please provide age'],
    minLength: 1,
    maxLength: 3,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
})

function removeTime(date) {
  // Ensure that the date is a valid Date object
  if (date instanceof Date) {
    // Set the time part to midnight
    date.setUTCHours(0, 0, 0, 0);
  }
  return date;
}

UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id, name: this.Fname },
    process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME, })
}

UserSchema.methods.comparePassword = async function (entryPassword) {
  const isMatch = await bcrypt.compare(entryPassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', UserSchema)