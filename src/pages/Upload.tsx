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
        images: imageUrls,
      });

      if (error) throw error;

      toast({
        title: "הבגד הועלה בהצלחה! 🌿",
        description: "תודה על התרומה לקהילה הירוקה שלנו",
      });
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
              <CardTitle className="text-3xl font-bold">תנו חיים חדשים לבגד 🌿</CardTitle>
              <p className="text-muted-foreground">שתפו את הבגד המיוחד שלכם עם הקהילה האקולוגית</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-3">
                  <Label htmlFor="images">תמונות הבגד *</Label>
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
                      <p className="text-sm text-muted-foreground">
                        לחצו להעלאת תמונות (עד 5 תמונות)
                      </p>
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
                  <Label htmlFor="title">שם הבגד *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="לדוגמה: חולצת טישרט וינטג׳ כותנה"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">ספרו את הסיפור של הבגד 📖</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="מה מיוחד בבגד הזה? מאיפה הגיע? איך הוא מרגיש?"
                    className="bg-background resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">מחיר (₪) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      dir="ltr"
                      placeholder="0.00"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">מותג</Label>
                    <Input
                      id="brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="לדוגמה: Zara, H&M"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">סוג הבגד</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="מה זה?" />
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
                    <Label htmlFor="size">מידה</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="איזה מידה?" />
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
                  <Label htmlFor="condition">מצב הבגד</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="באיזה מצב?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="חדש">חדש לגמרי ✨</SelectItem>
                      <SelectItem value="כמו חדש">כמו חדש 💫</SelectItem>
                      <SelectItem value="משומש מעט">משומש מעט 🌟</SelectItem>
                      <SelectItem value="משומש">משומש 💚</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || imageFiles.length === 0} 
                    className="flex-1 shadow-warm hover:shadow-lg transition-shadow"
                  >
                    {loading ? "מעלה... 🌿" : "העלאה לקהילה 🌱"}
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