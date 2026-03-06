const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const busRoutes = require('./busRoutes');
const stopRoutes = require('./stopRoutes');
const crowdRoutes = require('./crowdRoutes');
const adminRoutes = require('./adminRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/buses', busRoutes);
router.use('/stops', stopRoutes);
router.use('/crowd', crowdRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
