import {
  getAIStates,
  getAIDistricts,
  getAICommodities,
  predictPriceBackend,
  getRecM1Crops,
  getRecM1States,
  getRecM1Cities,
  getBuyerRecs,
  getRecM2Crops,
  getRecM2States,
  getRecM2Cities,
  getFarmerRecs,
} from './api';


/**
 * Fetch list of valid states from backend API
 */
export const fetchStates = async () => {
  try {
    const res = await getAIStates();
    return res.data?.states || [];
  } catch (error) {
    console.error('Error fetching AI states:', error);
    return [];
  }
};

/**
 * Fetch list of valid districts for a state from backend API
 */
export const fetchDistricts = async (state) => {
  if (!state) return [];
  try {
    const res = await getAIDistricts(state);
    return res.data?.districts || [];
  } catch (error) {
    console.error('Error fetching AI districts:', error);
    return [];
  }
};

/**
 * Fetch list of valid commodities from backend API
 */
export const fetchCommodities = async () => {
  try {
    const res = await getAICommodities();
    return res.data?.commodities || [];
  } catch (error) {
    console.error('Error fetching AI commodities:', error);
    return [];
  }
};

/**
 * Predict crop price by calling backend AI predict route
 */
export const predictCropPrice = async (state, district, commodity) => {
  try {
    const res = await predictPriceBackend({ state, district, commodity });

    if (res.data && res.data.success && typeof res.data.predicted_avg_price === 'number') {
      return {
        success: true,
        predicted_avg_price: res.data.predicted_avg_price,
        unit: res.data.unit || 'INR per quintal',
        state: res.data.state || state,
        district: res.data.district || district,
        commodity: res.data.commodity || commodity
      };
    }

    return {
      success: false,
      message: res.data?.message || 'Unable to predict the price right now. Unexpected response format.',
    };
  } catch (error) {
    console.error('Error calling predictCropPrice backend route:', error);
    if (error.response) {
      if (error.response.status === 422) {
        return {
          success: false,
          message: error.response.data?.message || 'Unable to generate prediction. Please check your selected state, district and commodity.',
        };
      }
      return {
        success: false,
        message: error.response.data?.message || `Prediction service returned an error (${error.response.status}). Please try again.`,
      };
    }
    return {
      success: false,
      message: 'Unable to predict the price right now. Please check network connection and try again.',
    };
  }
};

// ─── Recommendation Service Helpers ─────────────────────────────────────────

/**
 * Fetch crops for a given recommendation model ('m1' | 'm2')
 */
export const fetchRecCrops = async (model) => {
  try {
    const res = model === 'm1' ? await getRecM1Crops() : await getRecM2Crops();
    return res.data?.crops || [];
  } catch (error) {
    console.error(`Error fetching rec crops (${model}):`, error);
    return [];
  }
};

/**
 * Fetch states for a given recommendation model ('m1' | 'm2')
 */
export const fetchRecStates = async (model) => {
  try {
    const res = await getRecM1States();
    return res.data?.states || [];
  } catch (error) {
    console.error(`Error fetching rec states (${model}):`, error);
    return [];
  }
};

/**
 * Fetch cities for a given recommendation model and state
 */
export const fetchRecCities = async (model, state) => {
  if (!state) return [];
  try {
    const res = await getRecM1Cities(state);
    return res.data?.cities || [];
  } catch (error) {
    console.error(`Error fetching rec cities (${model}, ${state}):`, error);
    return [];
  }
};

/**
 * Fetch buyer recommendations (Model 1)
 * @param {{ crop_type: string, state: string, city: string, top_k: number }} params
 */
export const fetchBuyerRecommendations = async ({ crop_type, state, city, top_k }) => {
  try {
    const res = await getBuyerRecs({ crop_type, state, city, top_k: Number(top_k) || 5 });
    if (res.data?.success) {
      return { success: true, recommendations: res.data.recommendations || [], query: res.data.query };
    }
    return { success: false, message: res.data?.message || 'Unable to fetch recommendations. Please try again.' };
  } catch (error) {
    console.error('Error in fetchBuyerRecommendations:', error);
    if (error.response) {
      return { success: false, message: error.response.data?.message || `Service error (${error.response.status}). Please try again.` };
    }
    return { success: false, message: 'Unable to fetch recommendations right now. Please check your connection and try again.' };
  }
};

/**
 * Fetch farmer recommendations (Model 2)
 * @param {{ crop_type: string, state: string, city: string, top_k: number, candidate_k: number }} params
 */
export const fetchFarmerRecommendations = async ({ crop_type, state, city, top_k, candidate_k }) => {
  try {
    const res = await getFarmerRecs({
      crop_type,
      state,
      city,
      top_k: Number(top_k) || 5,
      candidate_k: Number(candidate_k) || 20,
    });
    if (res.data?.success) {
      return {
        success: true,
        recommendations: res.data.recommendations || [],
        query: res.data.query,
        weights: res.data.weights,
        count_returned: res.data.count_returned,
      };
    }
    return { success: false, message: res.data?.message || 'Unable to fetch recommendations. Please try again.' };
  } catch (error) {
    console.error('Error in fetchFarmerRecommendations:', error);
    if (error.response) {
      return { success: false, message: error.response.data?.message || `Service error (${error.response.status}). Please try again.` };
    }
    return { success: false, message: 'Unable to fetch recommendations right now. Please check your connection and try again.' };
  }
};
