const express = require('express');
const router = express.Router();
const crowdController = require('../controllers/crowdController');

// POST /api/crowd/update
router.post('/update', crowdController.updateCrowdStatus);

// GET /api/crowd/:bus_id
router.get('/:bus_id', crowdController.getCrowdStatus);

module.exports = router;
