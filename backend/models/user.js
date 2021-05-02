const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  biometrics: {
    birthdate: {
      type: Date,
      required: false
      },
    gender: {
      type: String,
      required: false
      },
    height: {
      type: Number,
      required: false
      },
    weight: {
      type: Number,
      required: false
      },
    armSpan: {
      type: Number,
      required: false
      }
    }
  })

const User = mongoose.model('User', UserSchema);

module.exports = User;
