import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sprout, ShoppingCart, Handshake, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-farm.jpg";

const features = [
  { icon: Sprout, title: "Direct from Farm", desc: "Buy produce directly from local farmers, no middlemen." },
  { icon: Handshake, title: "Bargain System", desc: "Negotiate prices with farmers through our unique bargain chat." },
  { icon: ShoppingCart, title: "Easy Ordering", desc: "Track orders from packing to delivery in real-time." },
  { icon: TrendingUp, title: "Fair Prices", desc: "Transparent pricing with quantity-based deals." },
];

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="w-7 h-7 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">Kissan Konnect</span>
          </Link>
          <Button onClick={() => navigate("/login")} className="gradient-hero text-primary-foreground border-0">
            Get Started <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Indian farmland at golden hour" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium gradient-golden text-secondary-foreground mb-6">
              🌾 Farm to Table, Directly
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-primary-foreground mb-6 leading-tight">
              Fresh Produce,<br />Fair Prices
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 font-body leading-relaxed">
              Connect directly with local farmers. Bargain for the best prices,
              track your orders, and enjoy farm-fresh produce delivered to your door.
            </p>
            <div className="flex gap-4">
              <Button size="lg" onClick={() => navigate("/login")} className="gradient-hero text-primary-foreground border-0 text-base px-8">
                Start Buying <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/register")} className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20 text-base px-8">
                I'm a Farmer
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Simple, transparent, and fair for everyone</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border bg-card shadow-card hover:shadow-elevated transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold text-card-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">Join thousands of farmers and buyers already on Kissan Konnect</p>
          <Button size="lg" onClick={() => navigate("/register")} className="gradient-golden text-secondary-foreground border-0 text-base px-10">
            Join Now <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 Kissan Konnect. Empowering Indian Agriculture.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
