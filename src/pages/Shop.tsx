import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { ProductFeed } from "@/components/ProductFeed";
import { Features } from "@/components/Features";
import { EcoImpact } from "@/components/EcoImpact";
import { Footer } from "@/components/Footer";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const gender = searchParams.get("gender");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8" dir="rtl">
        {gender && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              {gender === "women" ? "בגדים לנשים 👩" : "בגדים לגברים 👨"}
            </h1>
          </div>
        )}
        <ProductFeed genderFilter={gender} />
      </div>
      <Features />
      <EcoImpact />
      <Footer />
    </div>
  );
};

export default Shop;
