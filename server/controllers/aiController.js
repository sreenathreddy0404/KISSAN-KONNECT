const { statesAndDistricts, commodities } = require('../data/predictionData');

const ML_API_URL = 'https://model2-git-main-alpha-ac2b.vercel.app/predict';

/**
 * GET /api/ai/states
 * Returns list of supported states
 */
exports.getStates = (req, res) => {
  try {
    const states = Object.keys(statesAndDistricts);
    res.json({ success: true, states });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch states.' });
  }
};

/**
 * GET /api/ai/districts?state=Haryana or GET /api/ai/districts/:state
 * Returns list of supported districts for a state
 */
exports.getDistricts = (req, res) => {
  try {
    const state = req.query.state || req.params.state;
    if (!state) {
      return res.status(400).json({ success: false, message: 'State parameter is required.' });
    }

    const districts = statesAndDistricts[state] || [];
    res.json({ success: true, state, districts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch districts.' });
  }
};

/**
 * GET /api/ai/commodities
 * Returns list of supported commodities
 */
exports.getCommodities = (req, res) => {
  try {
    res.json({ success: true, commodities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch commodities.' });
  }
};

/**
 * POST /api/ai/predict
 * Body: { state, district, commodity }
 * Calls the ML API endpoint and returns price prediction
 */
exports.predictPrice = async (req, res) => {
  try {
    const { state, district, commodity } = req.body;

    if (!state || !district || !commodity) {
      return res.status(400).json({
        success: false,
        message: 'Please select state, district and commodity before predicting the price.'
      });
    }

    // Call external ML prediction API
    const response = await fetch(ML_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state, district, commodity }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 422) {
        return res.status(422).json({
          success: false,
          message: 'Unable to generate prediction. Please check your selected state, district and commodity.'
        });
      }
      return res.status(response.status).json({
        success: false,
        message: data?.error?.message || 'Prediction service returned an error. Please try again.'
      });
    }

    if (data && typeof data.predicted_avg_price === 'number') {
      return res.json({
        success: true,
        predicted_avg_price: data.predicted_avg_price,
        unit: data.unit || 'INR per quintal',
        state,
        district,
        commodity
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to predict the price right now. Unexpected response format from AI model.'
    });
  } catch (error) {
    console.error('Error in predictPrice backend controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to predict the price right now. Please check network connection and try again.'
    });
  }
};

// ─── Model 1 — Buyer Recommendation for Farmers ─────────────────────────────

const MODEL1_BASE = 'https://model-m-1.vercel.app/api';

/**
 * GET /api/ai/recommend/m1/crops
 */
exports.getRecM1Crops = async (req, res) => {
  try {
    const response = await fetch(`${MODEL1_BASE}/crops`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: 'Failed to fetch crops.' });
    }
    res.json({ success: true, crops: Array.isArray(data) ? data : (data.crops || []) });
  } catch (error) {
    console.error('Error in getRecM1Crops:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch crops.' });
  }
};

/**
 * GET /api/ai/recommend/m1/states
 */
exports.getRecM1States = async (req, res) => {
  try {
    const response = await fetch(`${MODEL1_BASE}/states`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: 'Failed to fetch states.' });
    }
    res.json({ success: true, states: Array.isArray(data) ? data : (data.states || []) });
  } catch (error) {
    console.error('Error in getRecM1States:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch states.' });
  }
};

/**
 * GET /api/ai/recommend/m1/cities/:state
 */
exports.getRecM1Cities = async (req, res) => {
  try {
    const state = req.params.state;
    if (!state) return res.status(400).json({ success: false, message: 'State is required.' });
    const response = await fetch(`${MODEL1_BASE}/cities/${encodeURIComponent(state)}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: 'Failed to fetch cities.' });
    }
    res.json({ success: true, cities: Array.isArray(data) ? data : (data.cities || []) });
  } catch (error) {
    console.error('Error in getRecM1Cities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities.' });
  }
};

/**
 * POST /api/ai/recommend/m1
 * Body: { crop_type, state, city, top_k }
 */
exports.getBuyerRecommendations = async (req, res) => {
  try {
    const { crop_type, state, city, top_k } = req.body;
    if (!crop_type || !state || !city) {
      return res.status(400).json({ success: false, message: 'Please select crop, state, and city.' });
    }
    const response = await fetch(`${MODEL1_BASE}/recommend`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop_type, state, city, top_k: Number(top_k) || 5 }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.message || data?.detail || 'Recommendation service error. Please try again.',
      });
    }
    return res.json({ success: true, query: data.query, recommendations: data.recommendations || [] });
  } catch (error) {
    console.error('Error in getBuyerRecommendations:', error);
    return res.status(500).json({ success: false, message: 'Unable to fetch recommendations right now. Please try again.' });
  }
};

// ─── Model 2 — Farmer Recommendation for Buyers ─────────────────────────────

const MODEL2_BASE = 'https://model-m-2.vercel.app';

/**
 * GET /api/ai/recommend/m2/crops
 */
exports.getRecM2Crops = async (req, res) => {
  try {
    const response = await fetch(`${MODEL2_BASE}/crops`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: 'Failed to fetch crops.' });
    }
    res.json({ success: true, crops: Array.isArray(data) ? data : (data.crops || []) });
  } catch (error) {
    console.error('Error in getRecM2Crops:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch crops.' });
  }
};

/**
 * GET /api/ai/recommend/m2/states
 */
exports.getRecM2States = async (req, res) => {
  try {
    const response = await fetch(`${MODEL2_BASE}/states`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: 'Failed to fetch states.' });
    }
    res.json({ success: true, states: Array.isArray(data) ? data : (data.states || []) });
  } catch (error) {
    console.error('Error in getRecM2States:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch states.' });
  }
};

/**
 * GET /api/ai/recommend/m2/cities/:state
 */
exports.getRecM2Cities = async (req, res) => {
  try {
    const state = req.params.state;
    if (!state) return res.status(400).json({ success: false, message: 'State is required.' });
    const response = await fetch(`${MODEL2_BASE}/cities/${encodeURIComponent(state)}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: 'Failed to fetch cities.' });
    }
    res.json({ success: true, cities: Array.isArray(data) ? data : (data.cities || []) });
  } catch (error) {
    console.error('Error in getRecM2Cities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities.' });
  }
};

/**
 * GET /api/ai/recommend/m2?crop_type=&state=&city=&top_k=&candidate_k=
 */
exports.getFarmerRecommendations = async (req, res) => {
  try {
    const { crop_type, state, city, top_k, candidate_k } = req.query;
    if (!crop_type || !state || !city) {
      return res.status(400).json({ success: false, message: 'Please select crop, state, and city.' });
    }
    const params = new URLSearchParams({
      crop_type,
      state,
      city,
      top_k: top_k || '5',
      candidate_k: candidate_k || '20',
    });
    const response = await fetch(`${MODEL2_BASE}/recommend?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.message || data?.detail || 'Recommendation service error. Please try again.',
      });
    }
    return res.json({
      success: true,
      query: data.query,
      count_returned: data.count_returned,
      weights: data.weights,
      recommendations: data.recommendations || [],
    });
  } catch (error) {
    console.error('Error in getFarmerRecommendations:', error);
    return res.status(500).json({ success: false, message: 'Unable to fetch recommendations right now. Please try again.' });
  }
};
