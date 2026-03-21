import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/AppStore";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Wheat, ShoppingBag, MessageSquare, IndianRupee } from "lucide-react";
import CropCard from "@/components/CropCard";
import { useNavigate } from "react-router-dom";
import { getMyCrops } from "@/services/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";


const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { userId, userName } = useAuth();
  const { orders, bargains } = useAppStore();
  const [myCrops, setMyCrops] = useState([]);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await getMyCrops();
        setMyCrops(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your crops. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  const myOrders = orders.filter(o => o.farmerId === userId);
  const myBargains = bargains.filter(b => b.farmerId === userId && b.status === "active");
  const revenue = myOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  const stats = [
    { label: "Active Crops", value: String(myCrops.length), icon: Wheat, color: "gradient-hero" },
    { label: "Total Orders", value: String(myOrders.length), icon: ShoppingBag, color: "gradient-golden" },
    { label: "Active Bargains", value: String(myBargains.length), icon: MessageSquare, color: "gradient-hero" },
    { label: "Revenue", value: `₹${revenue.toLocaleString()}`, icon: IndianRupee, color: "gradient-golden" },
  ];

  if (loading) {
		return <LoadingSpinner size="lg" text="Loading your dashboard..."/>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Welcome back, {userName.split(" ")[0]}! 🌾</h1>
        <p className="text-muted-foreground">Here's your farm overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-foreground">Your Crops</h2>
          <button onClick={() => navigate("/farmer/crops")} className="text-sm text-primary hover:underline">View all →</button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCrops.slice(0, 3).map(crop => (
            <CropCard key={crop.id} crop={crop} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
