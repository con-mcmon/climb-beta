const express = require('express');
const connectDB = require('./db');
const route = require('./routes/route');
const beta = require('./routes/beta');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/routes', route);
app.use('/beta', beta);

connectDB();

app.listen(port, () => console.log(`Server running on port ${port}`));
