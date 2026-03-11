export const ordersData = [
  { id: "ORD-001", cropId: "c5", cropName: "Alphonso Mangoes", buyerId: "bu2", buyerName: "Vikram Singh", farmerId: "f3", farmerName: "Amit Patel", pricePerKg: 300, quantityKg: 20, totalPrice: 6000, advancePaid: 900, remainingAmount: 4500, status: "in_transit", address: "45 MG Road, Jaipur, Rajasthan 302001", createdAt: "2026-03-05", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400" },
  { id: "ORD-002", cropId: "c3", cropName: "Fresh Tomatoes", buyerId: "bu1", buyerName: "Priya Sharma", farmerId: "f2", farmerName: "Sunita Devi", pricePerKg: 38, quantityKg: 50, totalPrice: 1900, advancePaid: 285, remainingAmount: 1425, status: "packing", address: "12 Nehru Street, Mumbai, Maharashtra 400001", createdAt: "2026-03-04", image: "https://images.unsplash.com/photo-1592924357228-91a4daadce55?w=400" },
  { id: "ORD-003", cropId: "c2", cropName: "Basmati Rice", buyerId: "bu2", buyerName: "Vikram Singh", farmerId: "f1", farmerName: "Rajesh Kumar", pricePerKg: 82, quantityKg: 100, totalPrice: 8200, advancePaid: 1230, remainingAmount: 6150, status: "delivered", address: "78 Gandhi Nagar, Delhi 110001", createdAt: "2026-02-25", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
  { id: "ORD-004", cropId: "c1", cropName: "Organic Wheat", buyerId: "bu1", buyerName: "Priya Sharma", farmerId: "f1", farmerName: "Rajesh Kumar", pricePerKg: 45, quantityKg: 200, totalPrice: 9000, advancePaid: 1350, remainingAmount: 6750, status: "confirmed", address: "22 Park Avenue, Mumbai, Maharashtra 400002", createdAt: "2026-03-06", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400" },
  { id: "ORD-005", cropId: "c2", cropName: "Basmati Rice", buyerId: "bu2", buyerName: "Vikram Singh", farmerId: "f1", farmerName: "Rajesh Kumar", pricePerKg: 80, quantityKg: 50, totalPrice: 4000, advancePaid: 600, remainingAmount: 3000, status: "packing", address: "10 Connaught Place, Delhi 110001", createdAt: "2026-03-07", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
  { id: "ORD-006", cropId: "c1", cropName: "Organic Wheat", buyerId: "bu2", buyerName: "Vikram Singh", farmerId: "f1", farmerName: "Rajesh Kumar", pricePerKg: 44, quantityKg: 150, totalPrice: 6600, advancePaid: 990, remainingAmount: 4950, status: "in_transit", address: "33 Rajpath, Delhi 110001", createdAt: "2026-03-03", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400" },
];

export const orderStatusLabels= {
  pending_payment: "Pending Payment",
  confirmed: "Order Confirmed",
  packing: "Packing",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export const orderStatusFlow= [
  "pending_payment", "confirmed", "packing", "in_transit", "out_for_delivery", "delivered"
];
