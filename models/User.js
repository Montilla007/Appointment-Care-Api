const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  role: {
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
    minlength: 8,
  },
  imageData: {
    type: String, 
    required: true
  },
  // Common fields for both doctors and patients
  // Add other common fields here

  hn: {
    type: Number,
    required: function () {
      return this.role === 'Doctor';
    }
  },
  barangay: {
    type: String,
    required: function () {
      return this.role === 'Doctor';
    }
  },
  municipality: {
    type: String,
    required: function () {
      return this.role === 'Doctor';
    }
  },
  province: {
    type: String,
    required: function () {
      return this.role === 'Doctor';
    }

  },
  status: {
    type: String,
    required: function () {
      return this.role === 'Doctor';
    },
    enum: ['Accept', 'Reject', 'Pending'],
  },
  specialty: {
    type: String,
    required: function () {
      return this.role === 'Doctor';
    },
  },
  md: {
    type: Number,
    required: function () {
      return this.role === 'Doctor';
    },
    min: [0, 'MD price must be at least 0'],
  },
  consultPrice: {
    type: Number,
    required: function () {
      return this.role === 'Doctor';
    },
    min: [0, 'Consultation price must be at least 0'],
  },
  f2f: {
    type: Boolean,
    required: function () {
      return this.role === 'Doctor';
    },
  },
  online: {
    type: Boolean,
    required: function () {
      return this.role === 'Doctor';
    },
  },
  imageLicense: {
    type: String,
    required: function () {
      return this.role === 'Doctor';
    }
  }
});

userSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id, name: this.Fname, role: this.role },
    process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME, })
}

userSchema.methods.comparePassword = async function (entryPassword) {
  const isMatch = await bcrypt.compare(entryPassword, this.password)
  return isMatch
}

userSchema.methods.updateImageData = async function (imageData) {
  this.imageData = imageData;
  await this.save();
};

module.exports = mongoose.model('User', userSchema)