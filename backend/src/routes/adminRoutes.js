const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// GET /api/admin/buses
router.get('/buses', adminController.getAllBuses);

// GET /api/admin/routes
router.get('/routes', adminController.getAllRoutes);

// GET /api/admin/analytics
router.get('/analytics', adminController.getAnalytics);

// GET /api/admin/fleet-status
router.get('/fleet-status', adminController.getFleetStatus);

module.exports = router;
