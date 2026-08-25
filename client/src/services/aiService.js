import { getAIStates, getAIDistricts, getAICommodities, predictPriceBackend } from './api';

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
