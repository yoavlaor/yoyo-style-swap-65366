import { ProductCard } from "./ProductCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

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
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    let query = supabase
      .from("items")
      .select("*, profiles(*)")
      .eq("is_sold", false)
      .or(`gender.eq.${genderFilter},gender.eq.unisex`);

    // Apply filters
    if (selectedCategories.length > 0) {
      query = query.in("category", selectedCategories);
    }
    if (selectedSizes.length > 0) {
      query = query.in("size", selectedSizes);
    }
    if (selectedConditions.length > 0) {
      query = query.in("condition", selectedConditions);
    }
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
    }

    const { data } = await query
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      let filteredData = data;
      
      // Filter by shipping method (array contains)
      if (selectedShipping.length > 0) {
        filteredData = filteredData.filter(item =>
          selectedShipping.some(method => item.shipping_method?.includes(method))
        );
      }
      
      setItems(filteredData);
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
  }, [genderFilter, selectedCategories, selectedSizes, selectedConditions, selectedShipping, searchQuery]);

  const toggleFilter = (value: string, selected: string[], setter: (val: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter(item => item !== value));
    } else {
      setter([...selected, value]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedConditions([]);
    setSelectedShipping([]);
    setMaxDistance(50);
    setSearchQuery("");
  };

  const categories = ["חולצה 👕", "מכנסיים 👖", "שמלה 👗", "חצאית 🎽", "ג'קט 🧥", "נעליים 👟", "תיק 👜", "אקססוריז 💍"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const conditions = ["חדש עם תווית 🏷️", "כמו חדש ✨", "משומש מצוין 👌", "משומש טוב 👍"];
  const shippingMethods = ["פנים אל פנים 🤝", "משלוח 📦", "איסוף מתחנת יויו 🏪"];

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
        <div className="mb-8 flex flex-col md:flex-row gap-4" dir="rtl">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="חפשו לפי מותג, סגנון או קטגוריה... 🔍" 
              className="pr-10 bg-card border-border/50 focus:border-electric transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-border/50 hover:border-electric hover:text-electric transition-colors">
                <SlidersHorizontal className="h-5 w-5 ml-2" />
                סינונים 🎚️
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-right">תסננו בול מה שמתאים לכם ✨</SheetTitle>
                <SheetDescription className="text-right">
                  בחרו את כל מה שחשוב לכם ונמצא בדיוק מה שאתם מחפשים 🎯
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6" dir="rtl">
                {/* Category Filter */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">סוג הפריט 👔</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleFilter(category, selectedCategories, setSelectedCategories)}
                        />
                        <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">מידות 📏</Label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <Button
                        key={size}
                        variant={selectedSizes.includes(size) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter(size, selectedSizes, setSelectedSizes)}
                        className="transition-all"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Condition Filter */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">מצב הבגד 👕</Label>
                  <div className="space-y-2">
                    {conditions.map(condition => (
                      <div key={condition} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`condition-${condition}`}
                          checked={selectedConditions.includes(condition)}
                          onCheckedChange={() => toggleFilter(condition, selectedConditions, setSelectedConditions)}
                        />
                        <label htmlFor={`condition-${condition}`} className="text-sm cursor-pointer">
                          {condition}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Method Filter */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">אופציות משלוח 🚚</Label>
                  <div className="space-y-2">
                    {shippingMethods.map(method => (
                      <div key={method} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`shipping-${method}`}
                          checked={selectedShipping.includes(method)}
                          onCheckedChange={() => toggleFilter(method, selectedShipping, setSelectedShipping)}
                        />
                        <label htmlFor={`shipping-${method}`} className="text-sm cursor-pointer">
                          {method}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Distance Filter */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">מרחק מקסימלי 📍</Label>
                  <div className="pt-2">
                    <Slider
                      value={[maxDistance]}
                      onValueChange={(value) => setMaxDistance(value[0])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      עד {maxDistance} ק״מ ממכם
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button onClick={clearFilters} variant="outline" className="flex-1">
                    נקה הכל 🗑️
                  </Button>
                  <Button onClick={() => setFilterOpen(false)} className="flex-1">
                    הצג תוצאות 🎉
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
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
