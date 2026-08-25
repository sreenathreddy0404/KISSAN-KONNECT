const express = require('express');
const {
  getStates,
  getDistricts,
  getCommodities,
  predictPrice
} = require('../controllers/aiController');

const router = express.Router();

// Public routes for AI Intelligence
router.get('/states', getStates);
router.get('/districts', getDistricts);
router.get('/districts/:state', getDistricts);
router.get('/commodities', getCommodities);
router.post('/predict', predictPrice);

module.exports = router;
