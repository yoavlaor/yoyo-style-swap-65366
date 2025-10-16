import Navbar from "@/components/Navbar";
import { ProductFeed } from "@/components/ProductFeed";
import { Footer } from "@/components/Footer";

const Feed = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProductFeed />
      <Footer />
    </div>
  );
};

export default Feed;
