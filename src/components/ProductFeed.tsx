import { ProductCard } from "./ProductCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Item {
  id: string;
  title: string;
  brand: string;
  price: number;
  images: string[];
  is_sold: boolean;
  shipping_method: string[];
  profiles: {
    username: string;
  };
}

export const ProductFeed = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<string>("women");
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const [userGender, setUserGender] = useState<string | null>(null);

  useEffect(() => {
    const loadUserGender = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("gender")
          .eq("id", user.id)
          .single();
        
        if (profile?.gender) {
          setUserGender(profile.gender);
          setGenderFilter(profile.gender === "male" ? "men" : "women");
        }
        
        // Check if user is admin
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!roles);
      }
    };
    
    loadUserGender();
  }, []);

  const loadItems = async () => {
    const { data } = await supabase
      .from("items")
      .select("*, profiles(*)")
      .eq("is_sold", false)
      .or(`gender.eq.${genderFilter},gender.eq.unisex`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setItems(data);
    }
    setLoading(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "הפריט נמחק בהצלחה",
        description: "הפריט הוסר מהמערכת",
      });

      // Refresh items
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "שגיאה במחיקת הפריט",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadItems();
  }, [genderFilter]);

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="font-tech text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-electric to-mint bg-clip-text text-transparent">
            גלו אופנה מדהימה 👗✨
          </h2>
          <p className="text-muted-foreground text-lg">
            פריטים משומשים מאומתים בבינה מלאכותית ממש קרוב אליכם
          </p>
        </div>

        {/* Gender Tabs */}
        <div className="mb-8 flex justify-center" dir="rtl">
          <Tabs value={genderFilter} onValueChange={setGenderFilter} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="women">👩 נשים</TabsTrigger>
              <TabsTrigger value="men">👨 גברים</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="חפשו לפי מותג, סגנון או קטגוריה... 🔍" 
              className="pl-10 bg-card border-border/50 focus:border-electric transition-colors"
            />
          </div>
          <Button variant="outline" className="border-border/50 hover:border-electric hover:text-electric transition-colors">
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            סינונים 🎚️
          </Button>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-12">טוען מוצרים...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12" dir="rtl">
            <p className="text-muted-foreground text-lg mb-4">עדיין אין פריטים בקטגוריה הזו 😊</p>
            <p className="text-muted-foreground">היו הראשונים להעלות משהו מגניב! ✨</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.images?.[0]}
                title={product.title}
                brand={product.brand}
                price={product.price}
                location={product.profiles?.username}
                verified={true}
                distance=""
                shippingMethods={product.shipping_method || []}
                isAdmin={isAdmin}
                onDelete={handleDeleteItem}
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
            עוד פריטים מגניבים 🎁
          </Button>
        </div>
      </div>
    </section>
  );
};
