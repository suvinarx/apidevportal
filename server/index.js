const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const catalogRoutes = require('./routes/catalogRoutes');
const apiRoutes = require('./routes/apiRoutes');
const categoryRoutes = require('./routes/categories');
// const businessTypeRoutes = require('./routes/businessTypeRoutes');
const regionRoutes = require('./routes/regionRoutes');
const authRoutes = require('./routes/auth');

const app = express();
const corsOptions = {
  origin: "http://44.204.68.110:3000",  // React app on EC2
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));



app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected')
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Mount routes
app.use('/api/catalogs', catalogRoutes);
app.use('/api/apis', apiRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/regions', regionRoutes);
// app.use('/api/business-types', businessTypeRoutes);
app.use("/api/auth",authRoutes);

// Default route
app.get('/', (req, res) => res.send('API Catalog backend is running!'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});
