import { ProductCard } from "./ProductCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Item {
  id: string;
  title: string;
  brand: string;
  price: number;
  images: string[];
  is_sold: boolean;
  profiles: {
    username: string;
  };
}

// Mock data for demonstration
const mockProducts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop",
    title: "Vintage Levi's Denim Jacket",
    brand: "Levi's",
    price: 180,
    location: "Tel Aviv",
    verified: true,
    distance: "1.2 km away"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800&auto=format&fit=crop",
    title: "Nike Air Force 1 White",
    brand: "Nike",
    price: 250,
    location: "Ramat Gan",
    verified: true,
    distance: "3.5 km away"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop",
    title: "Zara Oversized Blazer",
    brand: "Zara",
    price: 120,
    location: "Herzliya",
    verified: false,
    distance: "5.8 km away"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop",
    title: "Adidas Originals Hoodie",
    brand: "Adidas",
    price: 95,
    location: "Tel Aviv",
    verified: true,
    distance: "0.8 km away"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop",
    title: "Vintage Band T-Shirt",
    brand: "Vintage",
    price: 45,
    location: "Jaffa",
    verified: false,
    distance: "2.1 km away"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?w=800&auto=format&fit=crop",
    title: "H&M Cargo Pants",
    brand: "H&M",
    price: 65,
    location: "Givatayim",
    verified: true,
    distance: "4.2 km away"
  }
];

export const ProductFeed = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data } = await supabase
      .from("items")
      .select("*, profiles(*)")
      .eq("is_sold", false)
      .order("created_at", { ascending: false })
      .limit(6);

    if (data) {
      setItems(data);
    }
    setLoading(false);
  };

  const displayProducts = items.length > 0 ? items : mockProducts;

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="font-tech text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-electric to-mint bg-clip-text text-transparent">
            Discover Fashion
          </h2>
          <p className="text-muted-foreground text-lg">
            AI-verified secondhand items near you
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by brand, style, or category..." 
              className="pl-10 bg-card border-border/50 focus:border-electric transition-colors"
            />
          </div>
          <Button variant="outline" className="border-border/50 hover:border-electric hover:text-electric transition-colors">
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            Filters
          </Button>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-12">טוען מוצרים...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.images?.[0] || product.image}
                title={product.title}
                brand={product.brand}
                price={product.price}
                location={product.profiles?.username || product.location}
                verified={product.verified !== undefined ? product.verified : true}
                distance={product.distance}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="border-electric text-electric hover:bg-electric/10 transition-colors"
          >
            Load More Items
          </Button>
        </div>
      </div>
    </section>
  );
};
