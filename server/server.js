const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const listingRoutes = require('./routes/listings');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', listingRoutes);

// MongoDB connection (commented out for prototype)
/*
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/safestay', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));
*/

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});