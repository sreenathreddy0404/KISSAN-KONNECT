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
