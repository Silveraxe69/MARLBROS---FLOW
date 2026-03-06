const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');

// GET /api/buses
router.get('/', busController.getAllBuses);

// GET /api/buses/:bus_id
router.get('/:bus_id', busController.getBusById);

// GET /api/buses/:bus_id/location
router.get('/:bus_id/location', busController.getBusLocation);

// GET /api/buses/:bus_id/eta
router.get('/:bus_id/eta', busController.getBusETA);

module.exports = router;
