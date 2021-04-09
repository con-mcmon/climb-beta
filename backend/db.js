const mongoose = require('mongoose');
require('dotenv').config()

const connectDB = () => {
  mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log(`Database connected successfully`))
    .catch((err) => console.log(err));
  }

module.exports = connectDB;
