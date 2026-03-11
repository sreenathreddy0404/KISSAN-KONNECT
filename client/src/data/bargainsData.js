
export const bargainsData= [
  // 1. Active: buyer offered, farmer countered, waiting for buyer (Farmer f1)
  {
    id: "b1", cropId: "c1", cropName: "Organic Wheat", cropImage: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
    buyerId: "bu1", buyerName: "Priya Sharma", farmerId: "f1", farmerName: "Rajesh Kumar", status: "active",
    messages: [
      { id: "bm1", sender: "buyer", type: "offer", pricePerKg: 28, quantityKg: 100, totalPrice: 2800, message: "I need 100kg for my shop. Can you do ₹28/kg?", timestamp: "2026-03-06T10:00:00" },
      { id: "bm2", sender: "farmer", type: "counter", pricePerKg: 32, quantityKg: 100, totalPrice: 3200, message: "₹28 is too low. Best I can do is ₹32/kg.", timestamp: "2026-03-06T10:15:00" },
    ],
  },
  // 2. Active: first offer pending farmer response (Farmer f1)
  {
    id: "b2", cropId: "c2", cropName: "Basmati Rice", cropImage: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    buyerId: "bu2", buyerName: "Vikram Singh", farmerId: "f1", farmerName: "Rajesh Kumar", status: "active",
    messages: [
      { id: "bm3", sender: "buyer", type: "offer", pricePerKg: 70, quantityKg: 50, totalPrice: 3500, message: "I'd like 50kg at ₹70/kg. Is that okay?", timestamp: "2026-03-07T09:00:00" },
    ],
  },
  // 3. Active: multi-round negotiation (Farmer f1)
  {
    id: "b3", cropId: "c1", cropName: "Organic Wheat", cropImage: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
    buyerId: "bu2", buyerName: "Vikram Singh", farmerId: "f1", farmerName: "Rajesh Kumar", status: "active",
    messages: [
      { id: "bm4", sender: "buyer", type: "offer", pricePerKg: 25, quantityKg: 200, totalPrice: 5000, message: "Bulk order - 200kg at ₹25/kg?", timestamp: "2026-03-05T08:00:00" },
      { id: "bm5", sender: "farmer", type: "counter", pricePerKg: 35, quantityKg: 200, totalPrice: 7000, message: "Too low for organic wheat. ₹35/kg minimum.", timestamp: "2026-03-05T08:30:00" },
      { id: "bm6", sender: "buyer", type: "counter", pricePerKg: 30, quantityKg: 250, totalPrice: 7500, message: "How about ₹30/kg if I take 250kg?", timestamp: "2026-03-05T09:00:00" },
      { id: "bm7", sender: "farmer", type: "counter", pricePerKg: 32, quantityKg: 250, totalPrice: 8000, message: "₹32/kg for 250kg is my final offer.", timestamp: "2026-03-05T09:30:00" },
    ],
  },
  // 4. Accepted bargain (Farmer f1)
  {
    id: "b4", cropId: "c2", cropName: "Basmati Rice", cropImage: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    buyerId: "bu1", buyerName: "Priya Sharma", farmerId: "f1", farmerName: "Rajesh Kumar", status: "accepted",
    messages: [
      { id: "bm8", sender: "buyer", type: "offer", pricePerKg: 75, quantityKg: 80, totalPrice: 6000, message: "Can I get 80kg at ₹75/kg?", timestamp: "2026-03-04T11:00:00" },
      { id: "bm9", sender: "farmer", type: "counter", pricePerKg: 80, quantityKg: 80, totalPrice: 6400, message: "₹80/kg for this premium basmati.", timestamp: "2026-03-04T11:20:00" },
      { id: "bm10", sender: "buyer", type: "offer", pricePerKg: 78, quantityKg: 80, totalPrice: 6240, message: "Meet in the middle at ₹78?", timestamp: "2026-03-04T11:40:00" },
      { id: "bm11", sender: "farmer", type: "accept", pricePerKg: 78, quantityKg: 80, totalPrice: 6240, message: "Deal! ₹78/kg for 80kg. 🤝", timestamp: "2026-03-04T12:00:00" },
    ],
    finalPrice: 78, finalQuantity: 80,
  },
  // 5. Rejected bargain (Farmer f1)
  {
    id: "b5", cropId: "c1", cropName: "Organic Wheat", cropImage: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
    buyerId: "bu1", buyerName: "Priya Sharma", farmerId: "f1", farmerName: "Rajesh Kumar", status: "rejected",
    messages: [
      { id: "bm12", sender: "buyer", type: "offer", pricePerKg: 15, quantityKg: 50, totalPrice: 750, message: "₹15/kg for 50kg?", timestamp: "2026-03-03T14:00:00" },
      { id: "bm13", sender: "farmer", type: "reject", pricePerKg: 15, quantityKg: 50, totalPrice: 750, message: "Sorry, ₹15 is way below cost. Cannot accept.", timestamp: "2026-03-03T14:10:00" },
    ],
  },
  // 6. Accepted (Farmer f3)
  {
    id: "b6", cropId: "c5", cropName: "Alphonso Mangoes", cropImage: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400",
    buyerId: "bu2", buyerName: "Vikram Singh", farmerId: "f3", farmerName: "Amit Patel", status: "accepted",
    messages: [
      { id: "bm14", sender: "buyer", type: "offer", pricePerKg: 300, quantityKg: 20, totalPrice: 6000, message: "Can I get 20kg at ₹300/kg?", timestamp: "2026-03-05T14:00:00" },
      { id: "bm15", sender: "farmer", type: "accept", pricePerKg: 300, quantityKg: 20, totalPrice: 6000, message: "Deal! ₹300/kg for 20kg works.", timestamp: "2026-03-05T14:30:00" },
    ],
    finalPrice: 300, finalQuantity: 20,
  },
  // 7. Active: buyer countered farmer's counter (Farmer f2)
  {
    id: "b7", cropId: "c3", cropName: "Fresh Tomatoes", cropImage: "https://images.unsplash.com/photo-1592924357228-91a4daadce55?w=400",
    buyerId: "bu1", buyerName: "Priya Sharma", farmerId: "f2", farmerName: "Sunita Devi", status: "active",
    messages: [
      { id: "bm16", sender: "buyer", type: "offer", pricePerKg: 30, quantityKg: 40, totalPrice: 1200, message: "₹30/kg for 40kg of tomatoes?", timestamp: "2026-03-07T07:00:00" },
      { id: "bm17", sender: "farmer", type: "counter", pricePerKg: 36, quantityKg: 40, totalPrice: 1440, message: "These are fresh farm tomatoes, ₹36/kg.", timestamp: "2026-03-07T07:20:00" },
      { id: "bm18", sender: "buyer", type: "counter", pricePerKg: 33, quantityKg: 50, totalPrice: 1650, message: "₹33/kg if I take 50kg?", timestamp: "2026-03-07T07:45:00" },
    ],
  },
];
