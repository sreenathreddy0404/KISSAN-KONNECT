import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Wheat,
  Bot,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchStates,
  fetchDistricts,
  fetchCommodities,
  predictCropPrice
} from "@/services/aiService";
import Recommendations from "@/components/recommendations/Recommendations";

const AIIntelligence = () => {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "prediction" | "recommendation"
  
  // Data lists from backend
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Form State
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  
  // Status & Result States
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [apiError, setApiError] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);

  // Fetch initial states & commodities on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingData(true);
      const [stList, commList] = await Promise.all([
        fetchStates(),
        fetchCommodities()
      ]);
      if (stList && stList.length > 0) setStates(stList);
      if (commList && commList.length > 0) setCommodities(commList);
      setLoadingData(false);
    };

    loadInitialData();
  }, []);

  // Fetch districts whenever selected state changes
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      return;
    }

    const loadDistricts = async () => {
      setLoadingDistricts(true);
      const distList = await fetchDistricts(selectedState);
      setDistricts(distList);
      setLoadingDistricts(false);
    };

    loadDistricts();
  }, [selectedState]);

  // Handle State Change
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedDistrict(""); // Reset dependent district
    setValidationError("");
    setApiError("");
  };

  // Handle District Change
  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setValidationError("");
    setApiError("");
  };

  // Handle Commodity Change
  const handleCommodityChange = (e) => {
    setSelectedCommodity(e.target.value);
    setValidationError("");
    setApiError("");
  };

  // Handle Predict Action
  const handlePredict = async (e) => {
    e?.preventDefault();
    
    // Clear previous results & errors
    setValidationError("");
    setApiError("");
    
    // Validate inputs
    if (!selectedState || !selectedDistrict || !selectedCommodity) {
      setValidationError("Please select state, district and commodity before predicting the price.");
      return;
    }

    setLoading(true);

    try {
      const result = await predictCropPrice(selectedState, selectedDistrict, selectedCommodity);

      if (result.success && result.predicted_avg_price !== undefined) {
        setPredictionResult({
          price: result.predicted_avg_price,
          unit: result.unit,
          state: selectedState,
          district: selectedDistrict,
          commodity: selectedCommodity
        });
      } else {
        setApiError(result.message || "Unable to predict the price right now. Please try again.");
      }
    } catch (err) {
      setApiError("Unable to predict the price right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format price into Indian Rupees format (e.g., 1793.09 -> ₹1,793.09)
  const formatINR = (val) => {
    if (val === undefined || val === null || isNaN(val)) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  // Reset Form Action
  const handleReset = () => {
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedCommodity("");
    setPredictionResult(null);
    setValidationError("");
    setApiError("");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-card relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground border border-primary/20">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Intelligence Portal
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
            AI Intelligence
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Smart AI-powered insights to help farmers and buyers make better decisions.
          </p>
        </div>

        {(activeTab === "prediction" || activeTab === "recommendation") && (
          <Button
            variant="outline"
            onClick={() => setActiveTab("overview")}
            className="self-start md:self-auto gap-2 text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to AI Overview
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === "overview" ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Card 1: Price Prediction */}
          <div className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full transition-transform group-hover:scale-110 duration-500 pointer-events-none" />
            <div>
              <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center mb-5 text-primary-foreground shadow-md">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-display font-bold text-card-foreground">
                  Price Prediction
                </h2>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                  ML Model
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Predict the average market price of a crop based on the selected state, district, and commodity using our machine learning model.
              </p>
            </div>
            <div>
              <Button
                onClick={() => setActiveTab("prediction")}
                className="w-full gradient-hero text-primary-foreground border-0 gap-2 h-11 text-base font-medium shadow-sm hover:opacity-95 transition-opacity"
              >
                Open Price Prediction <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Card 2: Recommendations */}
          <div className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-bl-full transition-transform group-hover:scale-110 duration-500 pointer-events-none" />
            <div>
              <div className="w-14 h-14 rounded-2xl gradient-golden flex items-center justify-center mb-5 text-secondary-foreground shadow-md">
                <Users className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-display font-bold text-card-foreground">
                  Recommendations
                </h2>
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                  AI Model
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Get intelligent recommendations for farmers and buyers based on crop type, location, and market conditions using our AI recommendation models.
              </p>
            </div>
            <div>
              <Button
                onClick={() => setActiveTab("recommendation")}
                className="w-full gradient-golden text-secondary-foreground border-0 gap-2 h-11 text-base font-medium shadow-sm hover:opacity-95 transition-opacity"
              >
                Open Recommendations <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ) : activeTab === "prediction" ? (
        /* Price Prediction Interface View */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Main Form Container */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Crop Price Prediction
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select the location and commodity to predict the average market price using our AI model.
                </p>
              </div>
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{validationError}</span>
              </motion.div>
            )}

            {/* API Error Alert */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Prediction Failed</span>
                  <span>{apiError}</span>
                </div>
              </motion.div>
            )}

            {/* 3 Dropdown Inputs Form */}
            <form onSubmit={handlePredict} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* State Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="state-select" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" /> State <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="state-select"
                    value={selectedState}
                    onChange={handleStateChange}
                    disabled={loadingData}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer hover:border-primary/50 disabled:opacity-50"
                  >
                    <option value="">{loadingData ? "Loading States..." : "Select State"}</option>
                    {states.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Dropdown (Dependent on State) */}
                <div className="space-y-2">
                  <label htmlFor="district-select" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" /> District <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="district-select"
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    disabled={!selectedState || loadingDistricts}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      {loadingDistricts
                        ? "Loading Districts..."
                        : selectedState
                        ? "Select District"
                        : "Select State First"}
                    </option>
                    {districts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Commodity Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="commodity-select" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Wheat className="w-4 h-4 text-primary" /> Commodity <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="commodity-select"
                    value={selectedCommodity}
                    onChange={handleCommodityChange}
                    disabled={loadingData}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer hover:border-primary/50 disabled:opacity-50"
                  >
                    <option value="">{loadingData ? "Loading Commodities..." : "Select Commodity"}</option>
                    {commodities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
                {(selectedState || selectedDistrict || selectedCommodity || predictionResult) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleReset}
                    className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Clear Form
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto gradient-hero text-primary-foreground border-0 px-8 h-11 text-base font-semibold shadow-md hover:opacity-95 transition-all min-w-[180px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Predicting...
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5 mr-2" /> Predict Price
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Prediction Result UI Card */}
          {predictionResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-accent/20 p-6 md:p-8 shadow-elevated relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/15">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-primary/15 text-primary">
                    <Bot className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    AI Price Prediction Result
                  </span>
                </div>
                <Badge className="bg-success text-success-foreground hover:bg-success border-0 px-3 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Live AI Insights
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Predicted Average Price
                  </span>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-4xl md:text-5xl font-display font-extrabold text-foreground tracking-tight">
                      {formatINR(predictionResult.price)}
                    </span>
                    <span className="text-lg font-semibold text-primary bg-accent px-3 py-1 rounded-lg border border-primary/20">
                      {predictionResult.unit}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-card/80 backdrop-blur-md p-4 rounded-xl border border-border/80 shadow-sm space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Selected Parameters
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground font-medium flex-wrap">
                    <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {predictionResult.state}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md">
                      {predictionResult.district}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md">
                      <Wheat className="w-3.5 h-3.5 text-secondary" /> {predictionResult.commodity}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Recommendations View */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Recommendations />
        </motion.div>
      )}
    </div>
  );
};

export default AIIntelligence;
