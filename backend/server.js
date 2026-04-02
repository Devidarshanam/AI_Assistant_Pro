require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();
const uploadRoute = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main upload route
app.use('/upload', uploadRoute);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scores', require('./routes/scores'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
