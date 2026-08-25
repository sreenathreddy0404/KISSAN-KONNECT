const express = require('express');
const {
  getStates,
  getDistricts,
  getCommodities,
  predictPrice,
  // Model 1 — Buyer Recommendation for Farmers
  getRecM1Crops,
  getRecM1States,
  getRecM1Cities,
  getBuyerRecommendations,
  // Model 2 — Farmer Recommendation for Buyers
  getRecM2Crops,
  getRecM2States,
  getRecM2Cities,
  getFarmerRecommendations,
} = require('../controllers/aiController');

const router = express.Router();

// ── Price Prediction routes (existing) ───────────────────────────────────────
router.get('/states', getStates);
router.get('/districts', getDistricts);
router.get('/districts/:state', getDistricts);
router.get('/commodities', getCommodities);
router.post('/predict', predictPrice);

// ── Model 1 — Buyer Recommendation for Farmers ───────────────────────────────
router.get('/recommend/m1/crops', getRecM1Crops);
router.get('/recommend/m1/states', getRecM1States);
router.get('/recommend/m1/cities/:state', getRecM1Cities);
router.post('/recommend/m1', getBuyerRecommendations);

// ── Model 2 — Farmer Recommendation for Buyers ───────────────────────────────
router.get('/recommend/m2/crops', getRecM2Crops);
router.get('/recommend/m2/states', getRecM2States);
router.get('/recommend/m2/cities/:state', getRecM2Cities);
router.get('/recommend/m2', getFarmerRecommendations);

module.exports = router;
