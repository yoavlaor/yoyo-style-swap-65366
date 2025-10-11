import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, X } from "lucide-react";
import Navbar from "@/components/Navbar";

const EditItem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [brand, setBrand] = useState("");
  const [shippingMethods, setShippingMethods] = useState<string[]>([]);
  const [gender, setGender] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadItem(session.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate, id]);

  const loadItem = async (userId: string) => {
    if (!id) return;

    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .eq("seller_id", userId)
      .single();

    if (error || !data) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו למצוא את הפריט או שאין לך הרשאה לערוך אותו",
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }

    setTitle(data.title);
    setDescription(data.description || "");
    setPrice(data.price.toString());
    setCategory(data.category || "");
    setSize(data.size || "");
    setCondition(data.condition || "");
    setBrand(data.brand || "");
    setShippingMethods(data.shipping_method || []);
    setGender(data.gender || "");
    setExistingImages(data.images || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("items")
        .update({
          title,
          description,
          price: parseFloat(price),
          category,
          size,
          condition,
          brand,
          shipping_method: shippingMethods,
          gender,
        })
        .eq("id", id)
        .eq("seller_id", user.id);

      if (error) throw error;

      toast({
        title: "יופי! הבגד עודכן בהצלחה! 🎉",
        description: "כל השינויים נשמרו ✨",
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "שגיאה בעדכון הבגד",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-hero p-4" dir="rtl">
        <div className="max-w-2xl mx-auto py-8">
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-warm">
                <Edit className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">בואו נערוך! ✏️</CardTitle>
              <p className="text-muted-foreground">עדכנו את הפרטים של הבגד 💚</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Existing Images Display */}
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    <Label>התמונות הקיימות 📸</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`תמונה ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg shadow-soft"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">איזה שם נותנים לו? ✏️</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="למשל: חולצה מושלמת לקיץ ☀️"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">ספרו לנו עליו! 💭</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="מה מיוחד בבגד הזה?"
                    className="bg-background resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">כמה נבקש? 💰</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      dir="ltr"
                      placeholder="100"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">איזה מותג? 🏷️</Label>
                    <Input
                      id="brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="למשל: H&M, Zara"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">מה זה בעצם? 🤔</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="בחרו קטגוריה" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="חולצות">חולצות 👕</SelectItem>
                        <SelectItem value="מכנסיים">מכנסיים 👖</SelectItem>
                        <SelectItem value="שמלות">שמלות 👗</SelectItem>
                        <SelectItem value="נעליים">נעליים 👟</SelectItem>
                        <SelectItem value="תיקים">תיקים 👜</SelectItem>
                        <SelectItem value="אחר">אחר ✨</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">מה המידה? 📏</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="בחרו מידה" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                        <SelectItem value="XXL">XXL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">במה מצב? ✨</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="בחרו מצב" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">חדש לגמרי! 🌟</SelectItem>
                      <SelectItem value="like-new">כמעט לא נלבש 💎</SelectItem>
                      <SelectItem value="good">במצב טוב 👍</SelectItem>
                      <SelectItem value="fair">נלבש אבל תקין 💚</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">למי זה מיועד? 👥</Label>
                    <Select value={gender} onValueChange={setGender} required>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="בחרו" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="women">נשים 👩</SelectItem>
                        <SelectItem value="men">גברים 👨</SelectItem>
                        <SelectItem value="unisex">יוניסקס 🌈</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>איך נשלח? 📦</Label>
                    <div className="text-xs text-muted-foreground">(ניתן לבחור יותר מאחד)</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border border-border bg-background hover:bg-accent transition-colors">
                    <input
                      type="checkbox"
                      id="face-to-face"
                      checked={shippingMethods.includes("face-to-face")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShippingMethods([...shippingMethods, "face-to-face"]);
                        } else {
                          setShippingMethods(shippingMethods.filter(m => m !== "face-to-face"));
                        }
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                    <label htmlFor="face-to-face" className="flex-1 cursor-pointer text-sm">
                      פנים אל פנים 👥
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border border-border bg-background hover:bg-accent transition-colors">
                    <input
                      type="checkbox"
                      id="digital-stamp"
                      checked={shippingMethods.includes("digital-stamp")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShippingMethods([...shippingMethods, "digital-stamp"]);
                        } else {
                          setShippingMethods(shippingMethods.filter(m => m !== "digital-stamp"));
                        }
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                    <label htmlFor="digital-stamp" className="flex-1 cursor-pointer text-sm">
                      משלוח עם בול דיגיטלי 📬
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border border-border bg-background hover:bg-accent transition-colors">
                    <input
                      type="checkbox"
                      id="yoyo-station"
                      checked={shippingMethods.includes("yoyo-station")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShippingMethods([...shippingMethods, "yoyo-station"]);
                        } else {
                          setShippingMethods(shippingMethods.filter(m => m !== "yoyo-station"));
                        }
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                    <label htmlFor="yoyo-station" className="flex-1 cursor-pointer text-sm">
                      איסוף עצמי מתחנת YOYO 🏪
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || shippingMethods.length === 0} 
                    className="flex-1 shadow-warm hover:shadow-lg transition-shadow"
                  >
                    {loading ? "שומר... רגע קטן! ⏳" : "שמירת השינויים 💚"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/profile")} 
                    className="flex-1"
                  >
                    ביטול
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default EditItem;
