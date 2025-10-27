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
        title: "הבגד עלה בהצלחה",
        description: "הפריט שלך כעת מוצג לכולם",
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
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6" dir="rtl">
        <div className="max-w-3xl mx-auto py-12">
          <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/5 backdrop-blur-md border-primary/20 rounded-3xl animate-fade-in overflow-hidden">
            {/* Decorative top bar */}
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary"></div>
            
            <CardHeader className="text-center space-y-8 pb-12 pt-10">
              <div className="mx-auto w-28 h-28 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-glow animate-scale-in relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse opacity-50"></div>
                <UploadIcon className="w-14 h-14 text-white relative z-10" />
              </div>
              <CardTitle className="text-6xl md:text-7xl font-black bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-lg animate-glow-pulse">
                בואו נמכור משהו
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Upload */}
                <div className="space-y-5">
                  <Label htmlFor="images" className="text-2xl font-bold text-primary">תמונות</Label>
                  <div className="relative border-2 border-dashed border-primary/30 rounded-3xl p-12 text-center hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5 transition-all duration-300 bg-gradient-to-br from-muted/30 to-muted/10 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <input
                      type="file"
                      id="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="images" className="cursor-pointer relative z-10">
                      <div className="mb-8 inline-block">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50 animate-pulse"></div>
                          <UploadIcon className="w-24 h-24 mx-auto text-primary relative z-10 group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                      <p className="text-xl text-foreground mb-8 font-bold">
                        העלו תמונות (עד 5)
                      </p>
                      <div className="text-base text-muted-foreground bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 text-right space-y-4 border border-primary/20">
                        <p className="font-bold text-lg text-primary">טיפים לצילום:</p>
                        <div className="space-y-2">
                          <p className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            על משטח ישר ונקי
                          </p>
                          <p className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-accent rounded-full"></span>
                            צלמו את הבגד במלואו
                          </p>
                          <p className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-secondary rounded-full"></span>
                            וודאו שהתווית נראית
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-6 mt-6">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group animate-fade-in">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl blur opacity-0 group-hover:opacity-50 transition-all duration-300"></div>
                          <img
                            src={preview}
                            alt={`תצוגה מקדימה ${index + 1}`}
                            className="w-full h-40 object-cover rounded-3xl shadow-lg transition-all duration-300 group-hover:scale-105 relative border-2 border-primary/20"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center gap-4">
                            <button
                              type="button"
                              onClick={() => handleEditImage(index)}
                              className="bg-gradient-to-r from-primary to-accent text-white rounded-full p-4 hover:scale-110 transition-transform shadow-glow"
                              title="עריכה"
                            >
                              <Edit className="w-6 h-6" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full p-4 hover:scale-110 transition-transform shadow-glow"
                              title="מחיקה"
                            >
                              <X className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label htmlFor="title" className="text-xl font-bold text-primary flex items-center gap-2">
                    שם הפריט
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="למשל: חולצה מושלמת לקיץ"
                    className="bg-background/50 h-16 text-lg rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all hover:border-primary/40"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="description" className="text-xl font-bold text-primary">תיאור</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="מה מיוחד בבגד הזה? איפה לבשתם אותו?"
                    className="bg-background/50 text-lg rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all resize-none hover:border-primary/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label htmlFor="price" className="text-xl font-bold text-accent">מחיר</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      dir="ltr"
                      placeholder="100"
                      className="bg-background/50 h-16 text-lg rounded-2xl border-2 border-accent/20 focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all hover:border-accent/40"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="brand" className="text-xl font-bold text-secondary">מותג</Label>
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
                      <SelectTrigger className="bg-background/50 h-16 text-lg rounded-2xl border-2 border-secondary/20 focus:border-secondary hover:border-secondary/40">
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
                        <SelectItem value="אחר">אחר - כתוב ידנית</SelectItem>
                      </SelectContent>
                    </Select>
                    {showCustomBrand && (
                        <Input
                          id="customBrand"
                          value={customBrand}
                          onChange={(e) => setCustomBrand(e.target.value)}
                          placeholder="כתבו את שם המותג..."
                          className="bg-background/50 h-16 text-lg rounded-2xl border-2 border-secondary/20 focus:border-secondary focus:ring-4 focus:ring-secondary/20 transition-all animate-fade-in hover:border-secondary/40"
                        />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-xl font-bold">קטגוריה</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-background h-14 text-lg rounded-2xl border-border/50">
                        <SelectValue placeholder="בחרו קטגוריה" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="חולצה">חולצה</SelectItem>
                        <SelectItem value="מכנסיים">מכנסיים</SelectItem>
                        <SelectItem value="שמלה וחצאית">שמלה וחצאית</SelectItem>
                        <SelectItem value="נעליים">נעליים</SelectItem>
                        <SelectItem value="בגדי חורף">בגדי חורף</SelectItem>
                        <SelectItem value="בגד ים">בגד ים</SelectItem>
                        <SelectItem value="אקססוריז">אקססוריז</SelectItem>
                        <SelectItem value="תיק">תיק</SelectItem>
                        <SelectItem value="אחר">אחר</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="size" className="text-xl font-bold">מידה</Label>
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
                  <Label htmlFor="condition" className="text-xl font-bold">מצב</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="bg-background h-14 text-lg rounded-2xl border-border/50">
                      <SelectValue placeholder="בחרו מצב" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="חדש עם תווית">חדש עם תווית</SelectItem>
                      <SelectItem value="כמו חדש">כמו חדש</SelectItem>
                      <SelectItem value="משומש מצוין">משומש מצוין</SelectItem>
                      <SelectItem value="משומש טוב">משומש טוב</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="gender" className="text-xl font-bold">מגדר</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="bg-background h-14 text-lg rounded-2xl border-border/50">
                        <SelectValue placeholder="בחרו" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="women">נשים</SelectItem>
                        <SelectItem value="men">גברים</SelectItem>
                        <SelectItem value="unisex">יוניסקס</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="shippingMethod" className="text-xl font-bold">משלוח</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 space-x-reverse p-4 rounded-2xl border-2 border-border bg-background hover:bg-primary/5 hover:border-primary transition-all duration-200">
                        <input
                          type="checkbox"
                          id="face-to-face"
                          checked={shippingMethods.includes("פנים אל פנים")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShippingMethods([...shippingMethods, "פנים אל פנים"]);
                            } else {
                              setShippingMethods(shippingMethods.filter(m => m !== "פנים אל פנים"));
                            }
                          }}
                          className="w-5 h-5 accent-primary"
                        />
                        <label htmlFor="face-to-face" className="flex-1 cursor-pointer text-base font-medium">
                          פנים אל פנים
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse p-4 rounded-2xl border-2 border-border bg-background hover:bg-primary/5 hover:border-primary transition-all duration-200">
                        <input
                          type="checkbox"
                          id="delivery"
                          checked={shippingMethods.includes("משלוח")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShippingMethods([...shippingMethods, "משלוח"]);
                            } else {
                              setShippingMethods(shippingMethods.filter(m => m !== "משלוח"));
                            }
                          }}
                          className="w-5 h-5 accent-primary"
                        />
                        <label htmlFor="delivery" className="flex-1 cursor-pointer text-base font-medium">
                          משלוח
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse p-4 rounded-2xl border-2 border-border bg-background hover:bg-primary/5 hover:border-primary transition-all duration-200">
                        <input
                          type="checkbox"
                          id="yoyo-station"
                          checked={shippingMethods.includes("איסוף מתחנת יויו")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShippingMethods([...shippingMethods, "איסוף מתחנת יויו"]);
                            } else {
                              setShippingMethods(shippingMethods.filter(m => m !== "איסוף מתחנת יויו"));
                            }
                          }}
                          className="w-5 h-5 accent-primary"
                        />
                        <label htmlFor="yoyo-station" className="flex-1 cursor-pointer text-base font-medium">
                          איסוף מתחנת יויו
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <ItemVerificationCard 
                  onVerificationComplete={(verified) => {
                    if (verified) {
                      toast({
                        title: "הפריט אומת בהצלחה",
                        description: "הפריט שלך יקבל תג מאומת",
                      });
                    }
                  }}
                />

                <div className="flex gap-8 pt-8">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-primary via-accent to-secondary hover:shadow-2xl text-xl font-bold rounded-2xl h-20 hover:scale-105 transition-all shadow-glow"
                  >
                    {loading ? "מעלה..." : "העלה פריט"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate("/")} 
                    className="flex-1 text-xl font-semibold rounded-2xl h-20 hover:scale-105 transition-all border-2 hover:bg-muted"
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