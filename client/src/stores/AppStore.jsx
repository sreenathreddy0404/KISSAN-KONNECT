import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { cropsData } from "@/data/cropsData";
import { ordersData } from "@/data/ordersData";
import { bargainsData } from "@/data/bargainsData";
import { ratingsData, buyerRatingsData } from "@/data/ratingsData";



const AppContext = createContext(undefined);

let cropCounter = 100;
let orderCounter = 100;
let bargainCounter = 100;
let msgCounter = 100;
let ratingCounter = 100;

export const AppProvider = ({ children }) => {
  const [crops, setCrops] = useState([...cropsData]);
  const [orders, setOrders] = useState([...ordersData]);
  const [bargains, setBargains] = useState([...bargainsData]);
  const [ratings, setRatings] = useState([...ratingsData]);
  const [buyerRatings, setBuyerRatings] = useState([...buyerRatingsData]);

  const addCrop = useCallback((crop) => {
    const newCrop = {
      ...crop,
      id: `c${++cropCounter}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCrops(prev => [newCrop, ...prev]);
  }, []);

  const updateCrop = useCallback((id, data) => {
    setCrops(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteCrop = useCallback((id) => {
    setCrops(prev => prev.filter(c => c.id !== id));
  }, []);

  const createOrder = useCallback((order) => {
    const id = `ORD-${String(++orderCounter).padStart(3, "0")}`;
    setOrders(prev => [{ ...order, id }, ...prev]);
    return id;
  }, []);

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const payRemaining = useCallback((orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, remainingAmount: 0, status: "delivered" } : o));
  }, []);

  const createBargain = useCallback((bargain) => {
    const id = `b${++bargainCounter}`;
    setBargains(prev => [{ ...bargain, id, messages: [], status: "active" }, ...prev]);
    return id;
  }, []);

  const sendBargainMessage = useCallback((bargainId, msg) => {
    const newMsg = {
      ...msg,
      id: `bm${++msgCounter}`,
      timestamp: new Date().toISOString(),
    };
    setBargains(prev => prev.map(b =>
      b.id === bargainId ? { ...b, messages: [...b.messages, newMsg] } : b
    ));
  }, []);

  const acceptBargain = useCallback((bargainId, price, quantity) => {
    setBargains(prev => prev.map(b =>
      b.id === bargainId ? { ...b, status: "accepted", finalPrice: price, finalQuantity: quantity } : b
    ));
  }, []);

  const rejectBargain = useCallback((bargainId) => {
    setBargains(prev => prev.map(b =>
      b.id === bargainId ? { ...b, status: "rejected"  } : b
    ));
  }, []);

  // Ratings
  const addRating = useCallback((rating) => {
    const newRating = {
      ...rating,
      id: `r${++ratingCounter}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setRatings(prev => [...prev, newRating]);
  }, []);

  const getCropRatings = useCallback((cropId) => {
    return ratings.filter(r => r.cropId === cropId);
  }, [ratings]);

  const getCropAvgRating = useCallback((cropId) => {
    const cropRatings = ratings.filter(r => r.cropId === cropId);
    if (cropRatings.length === 0) return 0;
    return cropRatings.reduce((sum, r) => sum + r.rating, 0) / cropRatings.length;
  }, [ratings]);

  const addBuyerRating = useCallback((rating) => {
    const newRating = {
      ...rating,
      id: `br${++ratingCounter}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setBuyerRatings(prev => [...prev, newRating]);
  }, []);

  const getBuyerRatings = useCallback((buyerId) => {
    return buyerRatings.filter(r => r.buyerId === buyerId);
  }, [buyerRatings]);

  const getBuyerAvgRating = useCallback((buyerId) => {
    const bRatings = buyerRatings.filter(r => r.buyerId === buyerId);
    if (bRatings.length === 0) return 0;
    return bRatings.reduce((sum, r) => sum + r.rating, 0) / bRatings.length;
  }, [buyerRatings]);

  return (
    <AppContext.Provider value={{
      crops, orders, bargains, ratings, buyerRatings,
      addCrop, updateCrop, deleteCrop,
      createOrder, updateOrderStatus, payRemaining,
      createBargain, sendBargainMessage, acceptBargain, rejectBargain,
      addRating, getCropRatings, getCropAvgRating,
      addBuyerRating, getBuyerRatings, getBuyerAvgRating,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
};
