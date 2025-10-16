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
import { Upload as UploadIcon, X, Edit } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ItemVerificationCard } from "@/components/ItemVerificationCard";
import { ImageEditor } from "@/components/ImageEditor";

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
  const [customBrand, setCustomBrand] = useState("");
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<string[]>([]);
  const [gender, setGender] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);

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

  const handleEditImage = (index: number) => {
    setEditingImageIndex(index);
  };

  const handleSaveEditedImage = (blob: Blob) => {
    if (editingImageIndex === null) return;

    const file = new File([blob], imageFiles[editingImageIndex].name, { type: "image/jpeg" });
    const newImageFiles = [...imageFiles];
    newImageFiles[editingImageIndex] = file;
    setImageFiles(newImageFiles);

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviews = [...imagePreviews];
      newPreviews[editingImageIndex] = reader.result as string;
      setImagePreviews(newPreviews);
    };
    reader.readAsDataURL(file);

    setEditingImageIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingImageIndex(null);
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
        title: title || "פריט ללא שם",
        description: description || null,
        price: price ? parseFloat(price) : 0,
        category: category || null,
        size: size || null,
        condition: condition || null,
        brand: brand === "אחר" ? customBrand : brand || null,
        shipping_method: shippingMethods.length > 0 ? shippingMethods : null,
        gender: gender || null,
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
      setCustomBrand("");
      setShowCustomBrand(false);
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
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-6" dir="rtl">
        <div className="max-w-3xl mx-auto py-12">
          <Card className="shadow-glow bg-gradient-to-br from-card to-card/80 backdrop-blur-md border-border/30 rounded-3xl animate-fade-in">
            <CardHeader className="text-center space-y-6 pb-10">
              <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow animate-scale-in">
                <UploadIcon className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-5xl md:text-6xl font-black bg-gradient-primary bg-clip-text text-transparent drop-shadow-lg">בואו נמכור משהו מגניב! ✨</CardTitle>
              <p className="text-xl text-muted-foreground font-medium">תנו לבגדים שלכם סיפור חדש 💚</p>
            </CardHeader>
            <CardContent className="px-8 pb-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Upload */}
                <div className="space-y-4">
                  <Label htmlFor="images" className="text-lg font-semibold">בואו נראה אותו! 📸</Label>
                  <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all duration-300 bg-muted/30">
                    <input
                      type="file"
                      id="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <UploadIcon className="w-16 h-16 mx-auto text-primary mb-4 animate-pulse" />
                      <p className="text-base text-muted-foreground mb-4 font-medium">
                        כמה תמונות יפות מזוויות שונות (עד 5) ✨
                      </p>
                      <div className="text-sm text-muted-foreground bg-gradient-primary/10 rounded-xl p-4 text-right space-y-2">
                        <p className="font-bold text-lg text-primary">💡 טיפים לצילום מושלם:</p>
                        <p className="font-medium">📐 על משטח ישר ונקי</p>
                        <p className="font-medium">👕 תצלמו את הבגד במלואו</p>
                        <p className="font-medium">🏷️ וודאו שהתווית של החברה נראית בתמונה</p>
                      </div>
                    </label>
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`תצוגה מקדימה ${index + 1}`}
                            className="w-full h-32 object-cover rounded-2xl shadow-glow transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleEditImage(index)}
                              className="bg-primary text-white rounded-full p-3 hover:scale-110 transition-transform shadow-glow"
                              title="עריכה"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-red-500 text-white rounded-full p-3 hover:scale-110 transition-transform shadow-glow"
                              title="מחיקה"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="title" className="text-lg font-semibold">איזה שם נותנים לו? ✏️</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="למשל: חולצה מושלמת לקיץ ☀️"
                    className="bg-background h-14 text-lg rounded-2xl border-border/50 focus:ring-4 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-lg font-semibold">ספרו לנו עליו! 💭</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="מה מיוחד בבגד הזה? איפה לבשתם אותו? למה הוא מחכה לבית חדש?"
                    className="bg-background text-lg rounded-2xl border-border/50 focus:ring-4 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="price" className="text-lg font-semibold">כמה נבקש? 💰</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      dir="ltr"
                      placeholder="100"
                      className="bg-background h-14 text-lg rounded-2xl border-border/50 focus:ring-4 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="brand" className="text-lg font-semibold">איזה מותג? 🏷️</Label>
                    <Select 
                      value={brand} 
                      onValueChange={(value) => {
                        setBrand(value);
                        setShowCustomBrand(value === "אחר");
                        if (value !== "אחר") {
                          setCustomBrand("");
                        }
                      }}
                    >
                      <SelectTrigger className="bg-background h-14 text-lg rounded-2xl border-border/50">
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
                        <SelectItem value="אחר">אחר - כתוב ידנית ✏️</SelectItem>
                      </SelectContent>
                    </Select>
                    {showCustomBrand && (
                      <Input
                        id="customBrand"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        placeholder="כתבו את שם המותג..."
                        className="bg-background h-14 text-lg rounded-2xl border-border/50 focus:ring-4 focus:ring-primary/20 transition-all animate-fade-in"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-lg font-semibold">מה זה בעצם? 🤔</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-background h-14 text-lg rounded-2xl border-border/50">
                        <SelectValue placeholder="בחרו קטגוריה" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="חולצה 👕">חולצה 👕</SelectItem>
                        <SelectItem value="מכנסיים 👖">מכנסיים 👖</SelectItem>
                        <SelectItem value="שמלה וחצאית 👗">שמלה וחצאית 👗</SelectItem>
                        <SelectItem value="נעליים 👟">נעליים 👟</SelectItem>
                        <SelectItem value="בגדי חורף 🧥">בגדי חורף 🧥</SelectItem>
                        <SelectItem value="בגד ים 🩱">בגד ים 🩱</SelectItem>
                        <SelectItem value="אקססוריז 💍">אקססוריז 💍</SelectItem>
                        <SelectItem value="תיק 👜">תיק 👜</SelectItem>
                        <SelectItem value="אחר">אחר</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="size" className="text-lg font-semibold">מה המידה? 📏</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger className="bg-background h-14 text-lg rounded-2xl border-border/50">
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

                <div className="space-y-3">
                  <Label htmlFor="condition" className="text-lg font-semibold">במה מצב? ✨</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="bg-background h-14 text-lg rounded-2xl border-border/50">
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

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="gender" className="text-lg font-semibold">למי זה מיועד? 👥</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="bg-background h-14 text-lg rounded-2xl border-border/50">
                        <SelectValue placeholder="בחרו" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="women">נשים 👩</SelectItem>
                        <SelectItem value="men">גברים 👨</SelectItem>
                        <SelectItem value="unisex">יוניסקס 🌈</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="shippingMethod" className="text-lg font-semibold">איך נשלח? 📦</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 space-x-reverse p-4 rounded-2xl border-2 border-border bg-background hover:bg-primary/5 hover:border-primary transition-all duration-200">
                        <input
                          type="checkbox"
                          id="face-to-face"
                          checked={shippingMethods.includes("פנים אל פנים 🤝")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShippingMethods([...shippingMethods, "פנים אל פנים 🤝"]);
                            } else {
                              setShippingMethods(shippingMethods.filter(m => m !== "פנים אל פנים 🤝"));
                            }
                          }}
                          className="w-5 h-5 accent-primary"
                        />
                        <label htmlFor="face-to-face" className="flex-1 cursor-pointer text-base font-medium">
                          פנים אל פנים 🤝
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse p-4 rounded-2xl border-2 border-border bg-background hover:bg-primary/5 hover:border-primary transition-all duration-200">
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
                          className="w-5 h-5 accent-primary"
                        />
                        <label htmlFor="delivery" className="flex-1 cursor-pointer text-base font-medium">
                          משלוח 📦
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse p-4 rounded-2xl border-2 border-border bg-background hover:bg-primary/5 hover:border-primary transition-all duration-200">
                        <input
                          type="checkbox"
                          id="yoyo-station"
                          checked={shippingMethods.includes("איסוף מתחנת יויו 🏪")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShippingMethods([...shippingMethods, "איסוף מתחנת יויו 🏪"]);
                            } else {
                              setShippingMethods(shippingMethods.filter(m => m !== "איסוף מתחנת יויו 🏪"));
                            }
                          }}
                          className="w-5 h-5 accent-primary"
                        />
                        <label htmlFor="yoyo-station" className="flex-1 cursor-pointer text-base font-medium">
                          איסוף מתחנת יויו 🏪
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

                <div className="flex gap-6 pt-6">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    size="lg"
                    className="flex-1 shadow-glow text-lg font-bold rounded-2xl h-16 hover:scale-105 transition-transform"
                  >
                    {loading ? "מעלה... רגע קטן! ⏳" : "יאללה, בואו נמכור! 🎉"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate("/")} 
                    className="flex-1 text-lg font-semibold rounded-2xl h-16 hover:scale-105 transition-transform"
                  >
                    ביטול
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {editingImageIndex !== null && (
            <ImageEditor
              imageSrc={imagePreviews[editingImageIndex]}
              onSave={handleSaveEditedImage}
              onCancel={handleCancelEdit}
              isOpen={true}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Upload;