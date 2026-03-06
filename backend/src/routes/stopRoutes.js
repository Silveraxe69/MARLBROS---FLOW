const express = require('express');
const router = express.Router();
const stopController = require('../controllers/stopController');

// GET /api/stops
router.get('/', stopController.getAllStops);

// GET /api/stops/:stop_id
router.get('/:stop_id', stopController.getStopById);

// GET /api/stops/:stop_id/arrivals
router.get('/:stop_id/arrivals', stopController.getStopArrivals);

module.exports = router;
