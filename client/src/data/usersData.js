export const emptyAddress = {
  street: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

export const formatAddress = (addr) => {
  return [addr.street, addr.landmark, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
};

export const usersData= [
  { id: "f1", name: "Rajesh Kumar", email: "rajesh@farm.com", password: "farmer123", role: "farmer", address: { street: "Village Khatrai, GT Road", landmark: "Near Gurudwara", city: "Amritsar", state: "Punjab", pincode: "143001" }, phone: "+91 98765 43210", joinedAt: "2025-06-15", photo: "" },
  { id: "f2", name: "Sunita Devi", email: "sunita@farm.com", password: "farmer123", role: "farmer", address: { street: "Plot 12, Nashik Road", landmark: "Near Bus Stand", city: "Nashik", state: "Maharashtra", pincode: "422001" }, phone: "+91 98765 43211", joinedAt: "2025-08-20", photo: "" },
  { id: "f3", name: "Amit Patel", email: "amit@farm.com", password: "farmer123", role: "farmer", address: { street: "Farm House, Ratnagiri Bypass", landmark: "Near Mango Market", city: "Ratnagiri", state: "Maharashtra", pincode: "415612" }, phone: "+91 98765 43212", joinedAt: "2025-09-10", photo: "" },
  { id: "bu1", name: "Priya Sharma", email: "priya@buy.com", password: "buyer123", role: "buyer", address: { street: "301, Sunshine Apartments, Andheri West", landmark: "Near Metro Station", city: "Mumbai", state: "Maharashtra", pincode: "400058" }, phone: "+91 91234 56789", joinedAt: "2025-07-01", photo: "" },
  { id: "bu2", name: "Vikram Singh", email: "vikram@buy.com", password: "buyer123", role: "buyer", address: { street: "45, MI Road", landmark: "Near Hawa Mahal", city: "Jaipur", state: "Rajasthan", pincode: "302001" }, phone: "+91 91234 56780", joinedAt: "2025-10-05", photo: "" },
  { id: "admin1", name: "Admin", email: "admin@kissankonnect.com", password: "admin@123", role: "admin", address: { street: "Connaught Place", landmark: "", city: "Delhi", state: "Delhi", pincode: "110001" }, phone: "+91 90000 00000", joinedAt: "2025-01-01", photo: "" },
];
