import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload as UploadIcon, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ItemVerificationCard } from "@/components/ItemVerificationCard";

const Upload = () => {
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      toast({
        title: "ניתן להעלות עד 5 תמונות",
        variant: "destructive",
      });
      return;
    }

    setImageFiles([...imageFiles, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Upload images to storage
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);
        
        imageUrls.push(publicUrl);
      }

      const { error } = await supabase.from("items").insert({
        seller_id: user.id,
        title,
        description,
        price: parseFloat(price),
        category,
        size,
        condition,
        brand,
        shipping_method: shippingMethods,
        gender,
        images: imageUrls,
      });

      if (error) throw error;

      toast({
        title: "יאללה! הבגד עלה לאוויר! 🎉",
        description: "עכשיו כולם יכולים להתאהב בפריט המיוחד שלך ✨",
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
      setSize("");
      setCondition("");
      setBrand("");
      setShippingMethods([]);
      setGender("");
      setImageFiles([]);
      setImagePreviews([]);
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "שגיאה בהעלאת הבגד",
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
                <UploadIcon className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">בואו נמכור משהו מגניב! ✨</CardTitle>
              <p className="text-muted-foreground">תנו לבגדים שלכם סיפור חדש 💚</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-3">
                  <Label htmlFor="images">בואו נראה אותו! 📸</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors bg-muted/30">
                    <input
                      type="file"
                      id="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <UploadIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">
                        כמה תמונות יפות מזוויות שונות (עד 5) ✨
                      </p>
                      <div className="text-xs text-muted-foreground bg-primary/5 rounded-lg p-3 text-right space-y-1">
                        <p className="font-semibold text-primary">💡 טיפים לצילום מושלם:</p>
                        <p>📐 על משטח ישר ונקי</p>
                        <p>👕 תצלמו את הבגד במלואו</p>
                        <p>🏷️ וודאו שהתווית של החברה נראית בתמונה</p>
                      </div>
                    </label>
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`תצוגה מקדימה ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg shadow-soft"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                    placeholder="מה מיוחד בבגד הזה? איפה לבשתם אותו? למה הוא מחכה לבית חדש?"
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
                    <Select value={brand} onValueChange={setBrand}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="בחרו מותג" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Zara">Zara</SelectItem>
                        <SelectItem value="H&M">H&M</SelectItem>
                        <SelectItem value="Mango">Mango</SelectItem>
                        <SelectItem value="Pull&Bear">Pull&Bear</SelectItem>
                        <SelectItem value="Bershka">Bershka</SelectItem>
                        <SelectItem value="Nike">Nike</SelectItem>
                        <SelectItem value="Adidas">Adidas</SelectItem>
                        <SelectItem value="Castro">Castro</SelectItem>
                        <SelectItem value="Fox">Fox</SelectItem>
                        <SelectItem value="אחר">אחר</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <SelectItem value="חדש עם תווית 🏷️">חדש עם תווית 🏷️</SelectItem>
                      <SelectItem value="כמו חדש ✨">כמו חדש ✨</SelectItem>
                      <SelectItem value="משומש מצוין 👌">משומש מצוין 👌</SelectItem>
                      <SelectItem value="משומש טוב 👍">משומש טוב 👍</SelectItem>
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
                    <Label htmlFor="shippingMethod">איך נשלח? 📦</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border border-border bg-background hover:bg-accent transition-colors">
                        <input
                          type="checkbox"
                          id="pickup"
                          checked={shippingMethods.includes("איסוף עצמי 🤝")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShippingMethods([...shippingMethods, "איסוף עצמי 🤝"]);
                            } else {
                              setShippingMethods(shippingMethods.filter(m => m !== "איסוף עצמי 🤝"));
                            }
                          }}
                          className="w-4 h-4 accent-primary"
                        />
                        <label htmlFor="pickup" className="flex-1 cursor-pointer text-sm">
                          איסוף עצמי 🤝
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border border-border bg-background hover:bg-accent transition-colors">
                        <input
                          type="checkbox"
                          id="delivery"
                          checked={shippingMethods.includes("משלוח 📦")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShippingMethods([...shippingMethods, "משלוח 📦"]);
                            } else {
                              setShippingMethods(shippingMethods.filter(m => m !== "משלוח 📦"));
                            }
                          }}
                          className="w-4 h-4 accent-primary"
                        />
                        <label htmlFor="delivery" className="flex-1 cursor-pointer text-sm">
                          משלוח 📦
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border border-border bg-background hover:bg-accent transition-colors">
                        <input
                          type="checkbox"
                          id="both"
                          checked={shippingMethods.includes("שניהם 🎁")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShippingMethods([...shippingMethods, "שניהם 🎁"]);
                            } else {
                              setShippingMethods(shippingMethods.filter(m => m !== "שניהם 🎁"));
                            }
                          }}
                          className="w-4 h-4 accent-primary"
                        />
                        <label htmlFor="both" className="flex-1 cursor-pointer text-sm">
                          שניהם 🎁
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <ItemVerificationCard 
                  onVerificationComplete={(verified) => {
                    if (verified) {
                      toast({
                        title: "הפריט אומת בהצלחה! ✓",
                        description: "הפריט שלך יקבל תג מאומת",
                      });
                    }
                  }}
                />

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || imageFiles.length === 0 || shippingMethods.length === 0} 
                    className="flex-1 shadow-warm hover:shadow-lg transition-shadow"
                  >
                    {loading ? "מעלה... רגע קטן! ⏳" : "יאללה, בואו נמכור! 🎉"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/")} 
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

export default Upload;