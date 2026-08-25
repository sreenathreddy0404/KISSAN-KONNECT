import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Wheat,
  Loader2,
  AlertCircle,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  Truck,
  ShoppingCart,
  CreditCard,
  Package,
  RefreshCw,
  Info,
  BadgeCheck,
  Sprout,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchRecCrops,
  fetchRecStates,
  fetchRecCities,
  fetchBuyerRecommendations,
  fetchFarmerRecommendations,
} from "@/services/aiService";

// ─── Score bar component ─────────────────────────────────────────────────────
const ScoreBar = ({ label, value, color = "bg-primary" }) => {
  const pct = Math.round((value || 0) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-medium text-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Buyer Card (Model 1) ─────────────────────────────────────────────────────
const BuyerCard = ({ rec, index }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const scorePct = Math.round((rec.recommendation_score || 0) * 10000) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="rounded-2xl border border-border bg-card shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Card Header */}
      <div className="p-5 pb-4 border-b border-border/60 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-card-foreground leading-tight">
              {rec.buyer_name}
            </h3>
            <span className="text-xs text-muted-foreground">
              ID: {rec.buyer_id}
            </span>
          </div>
        </div>
        {/* Score Badge */}
        <div className="text-center shrink-0">
          <div className="text-xl font-bold text-primary leading-none">
            {scorePct.toFixed(2)}%
          </div>
          <div className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wider">
            Score
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4 flex-1">
        {/* Location & Distance */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs bg-accent/60 text-accent-foreground px-2.5 py-1 rounded-lg border border-primary/10">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {rec.city}, {rec.state}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs bg-muted/60 text-muted-foreground px-2.5 py-1 rounded-lg">
            📏 {rec.distance_km?.toFixed(2)} km away
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Price
            </div>
            <div className="text-base font-bold text-foreground">
              ₹{rec.purchase_price_per_kg?.toFixed(2)}/kg
            </div>
          </div>
          <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Rating
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
              <span className="text-base font-bold text-foreground">
                {rec.rating}/5
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Demand
            </div>
            <div className="text-base font-bold text-foreground">
              {rec.demand_quantity_kg} kg
            </div>
          </div>
          <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Minimum
            </div>
            <div className="text-base font-bold text-foreground">
              {rec.minimum_quantity_kg} kg
            </div>
          </div>
        </div>

        {/* Tags Row */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-border bg-card">
            <CreditCard className="w-3 h-3 text-primary" />
            Pay Reliability: {rec.payment_reliability}%
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-border bg-card">
            <Truck className="w-3 h-3 text-primary" />
            Pickup: {rec.pickup_available}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-border bg-card">
            <BadgeCheck className="w-3 h-3 text-primary" />
            Grade: {rec.preferred_quality_grade}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-border bg-card">
            <ShoppingCart className="w-3 h-3 text-primary" />
            Txns: {rec.num_transactions?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="px-5 pb-5 space-y-2">
        {/* Why Recommended */}
        {rec.explanation && (
          <button
            onClick={() => setShowExplanation((v) => !v)}
            className="w-full text-left text-xs text-primary hover:text-primary/80 flex items-center gap-1.5 font-medium transition-colors"
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            Why recommended?
            {showExplanation ? (
              <ChevronUp className="w-3.5 h-3.5 ml-auto" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-auto" />
            )}
          </button>
        )}
        <AnimatePresence>
          {showExplanation && rec.explanation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-muted-foreground bg-accent/30 rounded-xl p-3 border border-primary/10 leading-relaxed">
                {rec.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score Components */}
        {rec.score_components && (
          <>
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="w-full text-left text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 font-medium transition-colors"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`}
              />
              View scoring details
            </button>
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-muted/30 rounded-xl p-3 border border-border space-y-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Score Breakdown
                    </div>
                    {Object.entries(rec.score_components).map(([k, v]) => (
                      <ScoreBar
                        key={k}
                        label={k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        value={v}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ─── Farmer Card (Model 2) ─────────────────────────────────────────────────────
const FarmerCard = ({ rec, index }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const scorePct = Math.round((rec.recommendation_score || 0) * 10000) / 100;

  const scoreComponents = [
    { label: "Distance", value: rec.distance_component },
    { label: "Rating", value: rec.rating_component },
    { label: "Price", value: rec.price_component },
    { label: "Orders", value: rec.orders_component },
    { label: "Availability", value: rec.availability_component },
  ].filter((c) => c.value !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="rounded-2xl border border-border bg-card shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Card Header */}
      <div className="p-5 pb-4 border-b border-border/60 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-golden flex items-center justify-center text-secondary-foreground shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-card-foreground leading-tight">
              {rec.Farmer_name}
            </h3>
            <span className="text-xs text-muted-foreground">
              ID: {rec.Farmer_id}
            </span>
          </div>
        </div>
        {/* Score Badge */}
        <div className="text-center shrink-0">
          <div className="text-xl font-bold text-secondary leading-none">
            {scorePct.toFixed(2)}%
          </div>
          <div className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wider">
            Score
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4 flex-1">
        {/* Location & Distance */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs bg-accent/60 text-accent-foreground px-2.5 py-1 rounded-lg border border-primary/10">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {rec.city}, {rec.state}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs bg-muted/60 text-muted-foreground px-2.5 py-1 rounded-lg">
            📏 {rec.distance_km?.toFixed(2)} km away
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Rate
            </div>
            <div className="text-base font-bold text-foreground">
              ₹{rec.rate_per_kg?.toFixed(2)}/kg
            </div>
          </div>
          <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Rating
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
              <span className="text-base font-bold text-foreground">
                {rec.rating}/5
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Available
            </div>
            <div className="text-base font-bold text-foreground">
              {rec.quantity_available_kg?.toLocaleString()} kg
            </div>
          </div>
          <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Orders
            </div>
            <div className="text-base font-bold text-foreground">
              {rec.num_orders?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Crop Tag */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-border bg-card">
            <Wheat className="w-3 h-3 text-secondary" />
            {rec.crop_type}
          </span>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="px-5 pb-5 space-y-2">
        {/* Why Recommended */}
        {rec.explanation && (
          <button
            onClick={() => setShowExplanation((v) => !v)}
            className="w-full text-left text-xs text-secondary hover:text-secondary/80 flex items-center gap-1.5 font-medium transition-colors"
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            Why recommended?
            {showExplanation ? (
              <ChevronUp className="w-3.5 h-3.5 ml-auto" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-auto" />
            )}
          </button>
        )}
        <AnimatePresence>
          {showExplanation && rec.explanation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-muted-foreground bg-accent/30 rounded-xl p-3 border border-primary/10 leading-relaxed">
                {rec.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score Components */}
        {scoreComponents.length > 0 && (
          <>
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="w-full text-left text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 font-medium transition-colors"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`}
              />
              View scoring details
            </button>
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-muted/30 rounded-xl p-3 border border-border space-y-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Score Breakdown
                    </div>
                    {scoreComponents.map(({ label, value }) => (
                      <ScoreBar key={label} label={label} value={value} color="bg-secondary" />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ─── Dropdown Component ────────────────────────────────────────────────────────
const FormSelect = ({ id, label, icon: Icon, value, onChange, options, disabled, placeholder }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-semibold text-foreground flex items-center gap-1.5">
      <Icon className="w-4 h-4 text-primary" />
      {label} <span className="text-destructive">*</span>
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full h-11 rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// ─── Recommendation Form ────────────────────────────────────────────────────────
const RecommendationForm = ({ model, onResults }) => {
  const isModel1 = model === "m1";

  const [crops, setCrops] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [topK, setTopK] = useState(5);
  const [candidateK, setCandidateK] = useState(20);

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Load crops + states on mount or model change
  useEffect(() => {
    const load = async () => {
      setLoadingDropdowns(true);
      setSelectedCrop("");
      setSelectedState("");
      setSelectedCity("");
      setCities([]);
      const [cropList, stateList] = await Promise.all([
        fetchRecCrops(model),
        fetchRecStates(model),
      ]);
      setCrops(cropList);
      setStates(stateList);
      setLoadingDropdowns(false);
    };
    load();
  }, [model]);

  // Load cities when state changes
  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }
    const loadCities = async () => {
      setLoadingCities(true);
      setSelectedCity("");
      const cityList = await fetchRecCities(model, selectedState);
      setCities(cityList);
      setLoadingCities(false);
    };
    loadCities();
  }, [selectedState, model]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setValidationError("");

    if (!selectedCrop || !selectedState || !selectedCity) {
      setValidationError("Please select crop, state, and city before searching.");
      return;
    }

    setLoading(true);
    onResults({ status: "loading" });

    try {
      let result;
      if (isModel1) {
        result = await fetchBuyerRecommendations({
          crop_type: selectedCrop,
          state: selectedState,
          city: selectedCity,
          top_k: topK,
        });
      } else {
        result = await fetchFarmerRecommendations({
          crop_type: selectedCrop,
          state: selectedState,
          city: selectedCity,
          top_k: topK,
          candidate_k: candidateK,
        });
      }
      onResults({ status: "done", model, result, query: { crop: selectedCrop, state: selectedState, city: selectedCity } });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedCrop("");
    setSelectedState("");
    setSelectedCity("");
    setCities([]);
    setTopK(5);
    setCandidateK(20);
    setValidationError("");
    onResults(null);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${isModel1 ? "gradient-hero text-primary-foreground" : "gradient-golden text-secondary-foreground"}`}
        >
          {isModel1 ? <Building2 className="w-5 h-5" /> : <Sprout className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            {isModel1 ? "Find Buyers for Your Crop" : "Find Farmers for Your Crop"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isModel1
              ? "Discover buyers who match your crop and location."
              : "Discover farmers offering the crop you need."}
          </p>
        </div>
      </div>

      {/* Validation Error */}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormSelect
            id={`${model}-crop`}
            label="Crop"
            icon={Wheat}
            value={selectedCrop}
            onChange={(e) => { setSelectedCrop(e.target.value); setValidationError(""); }}
            options={crops}
            disabled={loadingDropdowns}
            placeholder={loadingDropdowns ? "Loading crops..." : "Select Crop"}
          />
          <FormSelect
            id={`${model}-state`}
            label="State"
            icon={MapPin}
            value={selectedState}
            onChange={(e) => { setSelectedState(e.target.value); setValidationError(""); }}
            options={states}
            disabled={loadingDropdowns}
            placeholder={loadingDropdowns ? "Loading states..." : "Select State"}
          />
          <FormSelect
            id={`${model}-city`}
            label="City"
            icon={MapPin}
            value={selectedCity}
            onChange={(e) => { setSelectedCity(e.target.value); setValidationError(""); }}
            options={cities}
            disabled={!selectedState || loadingCities}
            placeholder={loadingCities ? "Loading cities..." : selectedState ? "Select City" : "Select State First"}
          />
        </div>

        {/* Numeric Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md">
          <div className="space-y-2">
            <label
              htmlFor={`${model}-topk`}
              className="text-sm font-semibold text-foreground flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-primary" />
              No. of Recommendations
            </label>
            <input
              id={`${model}-topk`}
              type="number"
              min={1}
              max={20}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full h-11 rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
          {!isModel1 && (
            <div className="space-y-2">
              <label
                htmlFor={`${model}-candidatek`}
                className="text-sm font-semibold text-foreground flex items-center gap-1.5"
              >
                <Users className="w-4 h-4 text-primary" />
                Candidate Pool
              </label>
              <input
                id={`${model}-candidatek`}
                type="number"
                min={1}
                max={100}
                value={candidateK}
                onChange={(e) => setCandidateK(Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
          {(selectedCrop || selectedState || selectedCity) && (
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
            className={`w-full sm:w-auto border-0 px-8 h-11 text-base font-semibold shadow-md hover:opacity-95 transition-all min-w-[180px] ${isModel1 ? "gradient-hero text-primary-foreground" : "gradient-golden text-secondary-foreground"}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isModel1 ? "Finding Buyers..." : "Finding Farmers..."}
              </>
            ) : (
              <>
                {isModel1 ? <Building2 className="w-5 h-5 mr-2" /> : <Sprout className="w-5 h-5 mr-2" />}
                {isModel1 ? "Find Buyers" : "Find Farmers"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

// ─── Main Recommendations Component ────────────────────────────────────────────
const Recommendations = () => {
  const { role } = useAuth();
  const [activeModel, setActiveModel] = useState(
    role === "buyer" ? "m2" : "m1"
  );
  const [resultState, setResultState] = useState(null);

  // When admin switches model, clear results
  const handleModelSwitch = (m) => {
    setActiveModel(m);
    setResultState(null);
  };

  const handleResults = useCallback((state) => {
    setResultState(state);
  }, []);

  const recommendations = resultState?.result?.recommendations || [];
  const isLoading = resultState?.status === "loading";
  const hasError = resultState?.status === "done" && !resultState.result?.success;
  const hasResults = resultState?.status === "done" && resultState.result?.success;
  const weights = resultState?.result?.weights;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-card relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            {role === "farmer" && (
              <>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Find Buyers for Your Crop
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Discover buyers who match your crop and location.
                </p>
              </>
            )}
            {role === "buyer" && (
              <>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Find Farmers for Your Crop
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Discover farmers offering the crop you need.
                </p>
              </>
            )}
            {role === "admin" && (
              <>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  AI Recommendations
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Explore buyer and farmer recommendations using our AI models.
                </p>
              </>
            )}
          </div>

          {/* Admin Model Switcher */}
          {role === "admin" && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
              <button
                onClick={() => handleModelSwitch("m1")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeModel === "m1"
                    ? "bg-card shadow-sm text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Buyers for Farmers
              </button>
              <button
                onClick={() => handleModelSwitch("m2")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeModel === "m2"
                    ? "bg-card shadow-sm text-secondary border border-secondary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sprout className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Farmers for Buyers
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recommendation Form */}
      <RecommendationForm
        key={activeModel}
        model={activeModel}
        onResults={handleResults}
      />

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
            <p className="text-muted-foreground text-base font-medium">
              {activeModel === "m1"
                ? "Finding suitable buyers..."
                : "Finding suitable farmers..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 flex items-start gap-4"
          >
            <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-destructive mb-1">
                Unable to fetch recommendations
              </div>
              <p className="text-sm text-muted-foreground">
                {resultState.result?.message ||
                  "Something went wrong. Please try again."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {hasResults && recommendations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-border bg-card p-12 flex flex-col items-center gap-4 text-center shadow-card"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-lg mb-1">
                No Recommendations Found
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                No suitable{" "}
                {activeModel === "m1" ? "buyers" : "farmers"} found for
                the selected crop and location. Try a different combination.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {hasResults && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-display font-bold text-foreground">
                  {activeModel === "m1"
                    ? "Recommended Buyers"
                    : "Recommended Farmers"}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {recommendations.length} found
                </Badge>
              </div>

              {/* Model 2 Weights */}
              {activeModel === "m2" && weights && (
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Weights:</span>
                  {Object.entries(weights).map(([k, v]) => (
                    <span
                      key={k}
                      className="bg-muted/60 border border-border px-2 py-0.5 rounded-lg capitalize"
                    >
                      {k}: {Math.round(v * 100)}%
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {activeModel === "m1"
                ? recommendations.map((rec, i) => (
                    <BuyerCard key={rec.buyer_id || i} rec={rec} index={i} />
                  ))
                : recommendations.map((rec, i) => (
                    <FarmerCard key={rec.Farmer_id || i} rec={rec} index={i} />
                  ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Recommendations;
