import { ProductCard } from "./ProductCard";
import { Search, SlidersHorizontal, Grid, List } from "lucide-react";
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
  seller_id: string;
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
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "story">("grid");
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);

  useEffect(() => {
  const loadUserGender = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("gender")
        .eq("id", user.id)
        .maybeSingle();
      
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
  }, [genderFilter, selectedCategories, selectedSizes, selectedConditions, searchQuery]);

  const handleNextStory = () => {
    if (currentStoryIndex < items.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

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
    setMaxDistance(50);
    setSearchQuery("");
  };

  const categories = ["חולצה", "מכנסיים", "נעליים", "שמלה וחצאית", "בגדי חורף", "בגד ים", "אקססוריז", "תיק", "אחר"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const conditions = ["חדש עם תווית", "כמו חדש", "משומש מצוין", "משומש טוב"];

  return (
    <section className="py-4 px-4 bg-background min-h-screen">
      <div className="container mx-auto max-w-xl">
        {/* Gender Tabs - Big & Clean */}
        <div className="mb-6" dir="rtl">
          <Tabs value={genderFilter} onValueChange={setGenderFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/80 backdrop-blur-md h-14 rounded-2xl border border-border/50 shadow-lg">
              <TabsTrigger value="women" className="text-lg font-semibold rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                נשים
              </TabsTrigger>
              <TabsTrigger value="men" className="text-lg font-semibold rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                גברים
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search, Filters & View Toggle */}
        <div className="mb-6 flex gap-3" dir="rtl">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="חיפוש..." 
              className="pr-12 bg-card/80 backdrop-blur-md border-border/50 rounded-2xl h-14 text-lg focus:border-primary transition-all shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* View Mode Toggle */}
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode(viewMode === "grid" ? "story" : "grid")}
            className="rounded-2xl h-14 px-4 transition-all shadow-lg bg-card/80 backdrop-blur-md"
          >
            {viewMode === "grid" ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </Button>
          
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-border/50 rounded-2xl h-14 px-4 hover:border-primary hover:bg-primary/5 transition-all shadow-lg bg-card/80 backdrop-blur-md">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-right text-xl">סינון חכם</SheetTitle>
                <SheetDescription className="text-right">
                  מצאו בדיוק מה שאתם מחפשים
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6" dir="rtl">
                {/* Category Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">קטגוריה</Label>
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
                  <Label className="text-sm font-semibold">מידה</Label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <Button
                        key={size}
                        variant={selectedSizes.includes(size) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter(size, selectedSizes, setSelectedSizes)}
                        className="rounded-full transition-all"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Condition Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">מצב</Label>
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

                {/* Distance Filter */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">מרחק מקסימלי</Label>
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
                  <Button onClick={clearFilters} variant="outline" className="flex-1 rounded-full">
                    נקה
                  </Button>
                  <Button onClick={() => setFilterOpen(false)} className="flex-1 rounded-full">
                    הצג
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Product Display */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20" dir="rtl">
            <p className="text-muted-foreground text-xl">אין פריטים להצגה</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4">
            {items.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                sellerId={product.seller_id}
                image={product.images?.[0]}
                title={product.title}
                brand={product.brand}
                price={product.price}
                location={product.profiles?.username}
                verified={true}
                distance=""
                isAdmin={isAdmin}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* For You Header - Outside */}
            <div className="text-center mb-6" dir="rtl">
              <h2 className="text-4xl font-black bg-gradient-primary bg-clip-text text-transparent">
                בשבילך
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                {currentStoryIndex + 1} מתוך {items.length}
              </p>
            </div>
            
            {/* Story View */}
            <div className="relative h-[calc(100vh-280px)] overflow-hidden rounded-3xl">
              {items[currentStoryIndex] && (
                <div className="w-full h-full">
                  <ProductCard
                    id={items[currentStoryIndex].id}
                    sellerId={items[currentStoryIndex].seller_id}
                    image={items[currentStoryIndex].images?.[0]}
                    title={items[currentStoryIndex].title}
                    brand={items[currentStoryIndex].brand}
                    price={items[currentStoryIndex].price}
                    location={items[currentStoryIndex].profiles?.username}
                    verified={true}
                    distance=""
                    isAdmin={isAdmin}
                    onDelete={handleDeleteItem}
                  />
                </div>
              )}
              
              {/* Progress Indicator */}
              <div className="absolute top-4 left-0 right-0 flex gap-1 px-4 z-20">
                {items.map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                      index === currentStoryIndex
                        ? "bg-white shadow-glow"
                        : index < currentStoryIndex
                        ? "bg-white/70"
                        : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Navigation Button */}
            <div className="text-center mt-6">
              <Button
                onClick={handleNextStory}
                disabled={currentStoryIndex >= items.length - 1}
                size="lg"
                className="rounded-full px-8 shadow-glow text-lg font-semibold"
              >
                הבא
              </Button>
            </div>
          </div>
        )}

        {/* Load More */}
        {items.length > 0 && viewMode === "grid" && (
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-2xl border-primary/20 hover:bg-primary/5 transition-all shadow-lg h-14 px-8 text-lg font-semibold"
            >
              עוד פריטים
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
