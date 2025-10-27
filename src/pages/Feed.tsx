import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { ProductFeed } from "@/components/ProductFeed";
import { Footer } from "@/components/Footer";

const Feed = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />
      <ProductFeed />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Feed;
