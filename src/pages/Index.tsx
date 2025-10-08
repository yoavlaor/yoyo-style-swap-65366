import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ProductFeed } from "@/components/ProductFeed";
import { EcoImpact } from "@/components/EcoImpact";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <ProductFeed />
      <EcoImpact />
      <Footer />
    </div>
  );
};

export default Index;
