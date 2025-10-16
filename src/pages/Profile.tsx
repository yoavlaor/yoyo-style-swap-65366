import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit } from "lucide-react";
import Navbar from "@/components/Navbar";
import { VirtualMannequin } from "@/components/VirtualMannequin";
import { BodyMeasurementsForm } from "@/components/BodyMeasurementsForm";
import { FaceVerificationCard } from "@/components/FaceVerificationCard";
import { AdminUsersPanel } from "@/components/AdminUsersPanel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [myItems, setMyItems] = useState<any[]>([]);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  const [mySales, setMySales] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        loadMyItems(session.user.id);
        loadMyPurchases(session.user.id);
        loadMySales(session.user.id);
        checkAdminStatus(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        checkAdminStatus(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
      setUsername(data.username || "");
      setBio(data.bio || "");
    }
    setLoading(false);
  };

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const loadMyItems = async (userId: string) => {
    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });
    
    if (data) setMyItems(data);
  };

  const loadMyPurchases = async (userId: string) => {
    const { data } = await supabase
      .from("transactions")
      .select("*, items(*)")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false });
    
    if (data) setMyPurchases(data);
  };

  const loadMySales = async (userId: string) => {
    const { data } = await supabase
      .from("transactions")
      .select(`
        *,
        items(*),
        profiles!transactions_buyer_id_fkey(username, full_name),
        chats!inner(id, buyer_id, seller_id, item_id)
      `)
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });
    
    if (data) setMySales(data);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        bio,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "הפרופיל עודכן בהצלחה",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId)
      .eq("seller_id", user.id);

    if (error) {
      toast({
        title: "אופס! משהו השתבש",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "הבגד נמחק בהצלחה! 👋",
        description: "הבגד הוסר מהרשימה שלך",
      });
      loadMyItems(user.id);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-6" dir="rtl">
        <div className="max-w-6xl mx-auto space-y-8 py-12">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-primary bg-clip-text text-transparent drop-shadow-lg">
              האזור האישי שלי ✨
            </h1>
            <p className="text-xl text-muted-foreground font-medium">הכל במקום אחד, נוח ופשוט 💚</p>
          </div>

          <Tabs defaultValue="profile" className="animate-scale-in">
            <TabsList className={`grid w-full h-16 ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'} bg-card/80 backdrop-blur-md shadow-glow rounded-2xl p-2`}>
              <TabsTrigger value="profile" className="text-base font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-all">קצת עלי 👤</TabsTrigger>
              <TabsTrigger value="mannequin" className="text-base font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-all">הבובה שלי 👗</TabsTrigger>
              <TabsTrigger value="items" className="text-base font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-all">מה אני מוכר/ת 👕</TabsTrigger>
              <TabsTrigger value="purchases" className="text-base font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-all">מה קניתי 🛍️</TabsTrigger>
              <TabsTrigger value="sales" className="text-base font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-all">מה מכרתי 💰</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin" className="text-base font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-all">ניהול 👑</TabsTrigger>}
            </TabsList>

            <TabsContent value="profile" className="animate-fade-in">
              <Card className="shadow-glow bg-gradient-to-br from-card to-card/80 backdrop-blur-md border-border/30 rounded-3xl">
                <CardHeader className="pb-8">
                  <CardTitle className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">בואו נכיר! 👋</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="username" className="text-lg font-semibold">איך קוראים לך? ✏️</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="שם משתמש מגניב"
                        className="bg-background h-14 text-lg rounded-2xl border-border/50 focus:ring-4 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="bio" className="text-lg font-semibold">ספרו לנו משהו עליכם! 💭</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={6}
                        placeholder="מה מיוחד בכם? מה אתם אוהבים? שתפו אותנו! ✨"
                        className="bg-background text-lg rounded-2xl border-border/50 focus:ring-4 focus:ring-primary/20 transition-all resize-none"
                      />
                    </div>
                    <Button type="submit" size="lg" className="shadow-glow text-lg font-bold px-8 rounded-2xl hover:scale-105 transition-transform">שמירה 💚</Button>
                  </form>
                </CardContent>
              </Card>
              
              <FaceVerificationCard 
                userId={user?.id || ""} 
                isVerified={profile?.is_face_verified || false}
                onVerificationChange={() => loadProfile(user?.id || "")}
              />
            </TabsContent>

            <TabsContent value="mannequin">
              <VirtualMannequin
                height={profile?.height || undefined}
                weight={profile?.weight || undefined}
                bodyType={profile?.body_type || undefined}
              />

              <div className="mt-4">
                <BodyMeasurementsForm
                  userId={user?.id || ""}
                  initialData={{
                    height: profile?.height || undefined,
                    weight: profile?.weight || undefined,
                    bodyType: profile?.body_type || undefined,
                    gender: profile?.gender || undefined,
                  }}
                  onSave={() => loadProfile(user?.id || "")}
                />
              </div>
            </TabsContent>

            <TabsContent value="items" className="animate-fade-in">
              <Card className="shadow-glow bg-gradient-to-br from-card to-card/80 backdrop-blur-md border-border/30 rounded-3xl">
                <CardHeader className="pb-8">
                  <CardTitle className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">הבגדים שלי ({myItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myItems.map((item) => (
                      <Card key={item.id} className="hover:shadow-glow hover:scale-105 transition-all duration-300 rounded-2xl border-border/30 bg-gradient-to-br from-card to-card/80">
                        <CardContent className="p-6 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <h3 className="font-bold text-xl">{item.title}</h3>
                              <p className="text-primary font-black text-2xl">₪{item.price}</p>
                              <p className="text-base flex items-center gap-2 font-medium">
                                {item.is_sold ? (
                                  <span className="text-secondary">נמכר ✓</span>
                                ) : (
                                  <span className="text-green-500">זמין למכירה 🌿</span>
                                )}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/edit-item/${item.id}`)}
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent dir="rtl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>רגע, בטוחים? 🤔</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      אתם עומדים למחוק את "{item.title}" - זה לא ניתן לשחזור אחר כך
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>לא, חזרה! 🔙</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      כן, למחוק 🗑️
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {myItems.length === 0 && (
                      <p className="text-muted-foreground col-span-2 text-center py-8">
                        עדיין לא העלתם בגדים... בואו נתחיל! 🌱
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchases" className="animate-fade-in">
              <Card className="shadow-glow bg-gradient-to-br from-card to-card/80 backdrop-blur-md border-border/30 rounded-3xl">
                <CardHeader className="pb-8">
                  <CardTitle className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">הקניות שלי ({myPurchases.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {myPurchases.map((transaction) => (
                      <Card key={transaction.id} className="hover:shadow-glow hover:scale-105 transition-all duration-300 rounded-2xl border-border/30 bg-gradient-to-br from-card to-card/80">
                        <CardContent className="p-6 space-y-3">
                          <h3 className="font-bold text-2xl">{transaction.items?.title}</h3>
                          <p className="text-primary font-black text-3xl">₪{transaction.amount}</p>
                          <p className="text-base text-green-500 font-semibold">סטטוס: {transaction.status} ✓</p>
                        </CardContent>
                      </Card>
                    ))}
                    {myPurchases.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        עדיין לא קניתם כלום... בואו נמצא משהו יפה! 🛍️
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="animate-fade-in">
              <Card className="shadow-glow bg-gradient-to-br from-card to-card/80 backdrop-blur-md border-border/30 rounded-3xl">
                <CardHeader className="pb-8">
                  <CardTitle className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">המכירות שלי ({mySales.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mySales.map((sale) => (
                      <Card key={sale.id} className="hover:shadow-glow hover:scale-105 transition-all duration-300 rounded-2xl border-border/30 bg-gradient-to-br from-card to-card/80">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-bold text-2xl">{sale.items?.title}</h3>
                              <p className="text-primary font-black text-3xl">₪{sale.amount}</p>
                            </div>
                            <div className="text-left space-y-1">
                              <p className="text-base text-muted-foreground font-medium">נמכר ב:</p>
                              <p className="text-lg font-semibold">{new Date(sale.created_at).toLocaleDateString('he-IL')}</p>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">נקנה על ידי:</span>
                                <p className="font-medium">{sale.profiles?.username || 'לא ידוע'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">משלוח:</span>
                                <p className="font-medium">{sale.shipping_method}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">סטטוס:</span>
                                <p className="font-medium text-sage">{sale.status} ✓</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">פרטי הפריט:</span>
                                <p className="font-medium">{sale.items?.brand} | {sale.items?.size}</p>
                              </div>
                            </div>
                          </div>

                          {sale.chats && sale.chats.length > 0 && (
                            <Button
                              onClick={() => navigate(`/chat/${sale.chats[0].id}`)}
                              variant="outline"
                              className="w-full"
                            >
                              💬 צ'אט עם הקונה
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {mySales.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        עדיין לא מכרתם כלום... בואו נעלה בגדים! 📸
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin">
                <AdminUsersPanel />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Profile;