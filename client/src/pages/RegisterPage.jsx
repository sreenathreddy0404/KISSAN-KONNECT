import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sprout, Eye, EyeOff, UserPlus, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import  toast  from "react-hot-toast";
import { emptyAddress } from "@/data/usersData";
import heroImg from "@/assets/hero-farm.jpg";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [role, setRole] = useState("buyer");
  const [address, setAddress] = useState({ ...emptyAddress });
  const [phone, setPhone] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const updateAddress = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
          const data = await res.json();
          const a = data.address || {};
          setAddress({
            street: [a.road, a.neighbourhood, a.suburb].filter(Boolean).join(", ") || "",
            landmark: a.amenity || a.building || "",
            city: a.city || a.town || a.village || a.county || "",
            state: a.state || "",
            pincode: a.postcode || "",
          });
          toast.success("Location detected successfully! 📍");
        } catch {
          toast.error("Could not fetch address details");
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        toast.error("Location access denied. Please enter manually.");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !address.city || !address.state || !address.pincode || !phone) {
      toast.error("Please fill all required fields");
      return;
    }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirmPw) { toast.error("Passwords do not match"); return; }
    if (!/^\d{6}$/.test(address.pincode)) { toast.error("Enter a valid 6-digit pincode"); return; }

    setLoading(true);
    const result = await register(name, email, password, role, address, phone);
    console.log("Registration result:", result);
    setLoading(false);
    if (result.success) {
      toast.success("Registration successful! Welcome to Kissan Konnect 🌾");
      navigate(role === "farmer" ? "/farmer" : "/buyer");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={heroImg} alt="Indian farmland" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="absolute inset-0 flex items-end p-12">
          <div>
            <h2 className="text-4xl font-display font-bold text-primary-foreground mb-2">Kissan Konnect</h2>
            <p className="text-primary-foreground/80 text-lg font-body">Join the revolution in agriculture</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background overflow-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <Sprout className="w-8 h-8 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">Register</span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role */}
            <div>
              <Label>I am a</Label>
              <div className="flex gap-2 mt-1">
                {(["farmer", "buyer"]).map(r => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium capitalize transition-all ${
                      role === r
                        ? "gradient-hero text-primary-foreground border-transparent"
                        : "border-border text-muted-foreground hover:border-primary hover:text-foreground bg-card"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Email */}
            <div>
              <Label>Full Name</Label>
              <Input placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div>
                <Label>Confirm</Label>
                <Input type="password" placeholder="••••••" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
              </div>
            </div>

            {/* Address section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Address</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  className="text-xs h-7 gap-1"
                >
                  {detectingLocation ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Detecting...</>
                  ) : (
                    <><MapPin className="w-3 h-3" /> Auto-detect</>
                  )}
                </Button>
              </div>
              <div>
                <Input placeholder="Street / House No / Area" value={address.street} onChange={e => updateAddress("street", e.target.value)} />
              </div>
              <div>
                <Input placeholder="Landmark (optional)" value={address.landmark} onChange={e => updateAddress("landmark", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="City *" value={address.city} onChange={e => updateAddress("city", e.target.value)} />
                <Input placeholder="State *" value={address.state} onChange={e => updateAddress("state", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Pincode *" value={address.pincode} onChange={e => updateAddress("pincode", e.target.value)} maxLength={6} />
                <div>
                  <Input placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full gradient-hero text-primary-foreground border-0 h-11">
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Creating account...</span>
              ) : (
                <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Create Account</span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Login here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
