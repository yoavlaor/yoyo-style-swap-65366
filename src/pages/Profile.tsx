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
import { Trash2, Edit, Navigation, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { VirtualMannequin } from "@/components/VirtualMannequin";
import { BodyMeasurementsForm } from "@/components/BodyMeasurementsForm";
import { FaceVerificationCard } from "@/components/FaceVerificationCard";
import { AdminUsersPanel } from "@/components/AdminUsersPanel";
import { PaymentSettings } from "@/components/PaymentSettings";
import { useGeolocation } from "@/hooks/useGeolocation";
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
  const [savingLocation, setSavingLocation] = useState(false);
  const userLocation = useGeolocation();

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

  const handleSaveLocation = async () => {
    if (!user || !userLocation.latitude || !userLocation.longitude) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לקבל את המיקום שלך. אנא וודא שנתת הרשאה למיקום",
        variant: "destructive",
      });
      return;
    }

    setSavingLocation(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      })
      .eq("id", user.id);

    setSavingLocation(false);

    if (error) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "המיקום נשמר בהצלחה! 📍",
        description: "עכשיו נראה לך מרחקים מדויקים לכל הפריטים",
      });
      loadProfile(user.id);
    }
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
        title: "הבגד נמחק בהצלחה",
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
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-3 sm:p-6" dir="rtl">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 py-6 sm:py-12">
          <div className="text-center space-y-3 sm:space-y-4 animate-fade-in">
            {isAdmin && (
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 text-white font-black text-lg rounded-full shadow-glow mb-4 animate-pulse">
                DOMAIN
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black bg-gradient-primary bg-clip-text text-transparent drop-shadow-lg">
              האזור האישי שלי
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground font-medium">הכל במקום אחד, נוח ופשוט</p>
          </div>

          <Tabs defaultValue="profile" className="animate-scale-in">
            <TabsList className="w-full h-auto min-h-14 bg-card/80 backdrop-blur-md shadow-glow rounded-2xl p-2 flex flex-wrap gap-2 justify-center">
              <TabsTrigger value="profile" className="text-sm sm:text-base font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-all flex-shrink-0 px-3 sm:px-4">קצת עלי</TabsTrigger>
              <TabsTrigger value="mannequin" className="text-sm sm:text-base font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-all flex-shrink-0 px-3 sm:px-4">הבובה שלי</TabsTrigger>
              <TabsTrigger value="items" className="text-sm sm:text-base font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-all flex-shrink-0 px-3 sm:px-4">מה אני מוכר/ת</TabsTrigger>
              <TabsTrigger value="purchases" className="text-sm sm:text-base font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-all flex-shrink-0 px-3 sm:px-4">מה קניתי</TabsTrigger>
              <TabsTrigger value="sales" className="text-sm sm:text-base font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-all flex-shrink-0 px-3 sm:px-4">מה מכרתי</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin" className="text-sm sm:text-base font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-all flex-shrink-0 px-3 sm:px-4">ניהול</TabsTrigger>}
            </TabsList>

            <TabsContent value="profile" className="animate-fade-in">
              <Card className="shadow-glow bg-gradient-to-br from-card to-card/80 backdrop-blur-md border-border/30 rounded-3xl">
                <CardHeader className="pb-4 sm:pb-8">
                  <CardTitle className="text-2xl sm:text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">בואו נכיר</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6 sm:space-y-8">
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="username" className="text-base sm:text-lg font-semibold text-primary">?איך קוראים לך</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="שם משתמש מגניב"
                        className="bg-background h-12 sm:h-14 text-base sm:text-lg rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all hover:border-primary/40"
                      />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="bio" className="text-base sm:text-lg font-semibold text-primary">ספרו לנו משהו עליכם</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        placeholder="מה מיוחד בכם? מה אתם אוהבים? שתפו אותנו"
                        className="bg-background text-base sm:text-lg rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all resize-none hover:border-primary/40"
                      />
                    </div>
                    <Button type="submit" size="lg" className="shadow-glow text-base sm:text-lg font-bold px-6 sm:px-8 rounded-2xl hover:scale-105 transition-transform w-full sm:w-auto">שמירה</Button>
                  </form>

                  {/* Location Section */}
                  <Card className="mt-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-primary" />
                        המיקום שלי
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile?.latitude && profile?.longitude ? (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            המיקום שלך נשמר בהצלחה! זה עוזר לנו להראות לך מרחקים מדויקים לפריטים.
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                              קואורדינטות: {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          עדיין לא שמרת את המיקום שלך. שמירת מיקום תעזור לך לראות כמה רחוק כל פריט ממך.
                        </p>
                      )}
                      <Button
                        onClick={handleSaveLocation}
                        disabled={savingLocation || userLocation.loading}
                        variant="outline"
                        className="w-full"
                      >
                        {savingLocation ? (
                          "שומר..."
                        ) : userLocation.loading ? (
                          "מאתר..."
                        ) : userLocation.error ? (
                          "שגיאה - נסה שוב"
                        ) : (
                          <>
                            <Navigation className="w-4 h-4 ml-2" />
                            {profile?.latitude ? "עדכן מיקום" : "שמור את המיקום שלי"}
                          </>
                        )}
                      </Button>
                      {userLocation.error && (
                        <p className="text-xs text-destructive">{userLocation.error}</p>
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
              
              <FaceVerificationCard 
                userId={user?.id || ""} 
                isVerified={profile?.is_face_verified || false}
                onVerificationChange={() => loadProfile(user?.id || "")}
              />

              <PaymentSettings userId={user?.id || ""} />
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
                <CardHeader className="pb-4 sm:pb-8">
                  <CardTitle className="text-2xl sm:text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">הבגדים שלי ({myItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {myItems.map((item) => (
                      <Card key={item.id} className="hover:shadow-glow hover:scale-105 transition-all duration-300 rounded-2xl border-border/30 bg-gradient-to-br from-card to-card/80">
                        <CardContent className="p-4 sm:p-6 space-y-3">
                          <div className="flex items-start justify-between gap-2 sm:gap-3">
                            <div className="flex-1 space-y-1 sm:space-y-2">
                              <h3 className="font-bold text-lg sm:text-xl">{item.title}</h3>
                              <p className="text-primary font-black text-xl sm:text-2xl">₪{item.price}</p>
                              <p className="text-sm sm:text-base flex items-center gap-2 font-medium">
                                {item.is_sold ? (
                                  <span className="text-secondary">נמכר</span>
                                ) : (
                                  <span className="text-green-500">זמין למכירה</span>
                                )}
                              </p>
                            </div>
                            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/edit-item/${item.id}`)}
                                className="hover:bg-primary/10 hover:text-primary h-9 w-9 sm:h-10 sm:w-10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-destructive/10 hover:text-destructive h-9 w-9 sm:h-10 sm:w-10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent dir="rtl" className="max-w-[90vw] sm:max-w-md">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-lg sm:text-xl">רגע, בטוחים?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm sm:text-base">
                                      אתם עומדים למחוק את "{item.title}" - זה לא ניתן לשחזור אחר כך
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                    <AlertDialogCancel className="m-0">לא, חזרה</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="bg-destructive hover:bg-destructive/90 m-0"
                                    >
                                      כן, למחוק
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
                      <p className="text-muted-foreground col-span-full text-center py-8 text-sm sm:text-base">
                        עדיין לא העלתם בגדים... בואו נתחיל
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchases" className="animate-fade-in">
              <Card className="shadow-glow bg-gradient-to-br from-card to-card/80 backdrop-blur-md border-border/30 rounded-3xl">
                <CardHeader className="pb-4 sm:pb-8">
                  <CardTitle className="text-2xl sm:text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">הקניות שלי ({myPurchases.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 sm:space-y-6">
                    {myPurchases.map((transaction) => (
                      <Card key={transaction.id} className="hover:shadow-glow hover:scale-105 transition-all duration-300 rounded-2xl border-border/30 bg-gradient-to-br from-card to-card/80">
                        <CardContent className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                          <h3 className="font-bold text-lg sm:text-2xl">{transaction.items?.title}</h3>
                          <p className="text-primary font-black text-2xl sm:text-3xl">₪{transaction.amount}</p>
                          <p className="text-sm sm:text-base text-green-500 font-semibold">סטטוס: {transaction.status}</p>
                        </CardContent>
                      </Card>
                    ))}
                    {myPurchases.length === 0 && (
                      <p className="text-muted-foreground text-center py-8 text-sm sm:text-base">
                        עדיין לא קניתם כלום... בואו נמצא משהו יפה
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="animate-fade-in">
              <Card className="shadow-glow bg-gradient-to-br from-card to-card/80 backdrop-blur-md border-border/30 rounded-3xl">
                <CardHeader className="pb-4 sm:pb-8">
                  <CardTitle className="text-2xl sm:text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">המכירות שלי ({mySales.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 sm:space-y-6">
                    {mySales.map((sale) => (
                      <Card key={sale.id} className="hover:shadow-glow hover:scale-105 transition-all duration-300 rounded-2xl border-border/30 bg-gradient-to-br from-card to-card/80">
                        <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                            <div className="space-y-1 sm:space-y-2">
                              <h3 className="font-bold text-lg sm:text-2xl">{sale.items?.title}</h3>
                              <p className="text-primary font-black text-2xl sm:text-3xl">₪{sale.amount}</p>
                            </div>
                            <div className="text-right sm:text-left space-y-1 w-full sm:w-auto">
                              <p className="text-sm sm:text-base text-muted-foreground font-medium">נמכר ב:</p>
                              <p className="text-base sm:text-lg font-semibold">{new Date(sale.created_at).toLocaleDateString('he-IL')}</p>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">נקנה על ידי:</span>
                                <p className="font-medium">{sale.profiles?.username || 'לא ידוע'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">סטטוס:</span>
                                <p className="font-medium text-sage">{sale.status}</p>
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
                              className="w-full text-sm sm:text-base"
                            >
                              צ'אט עם הקונה
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {mySales.length === 0 && (
                      <p className="text-muted-foreground text-center py-8 text-sm sm:text-base">
                        עדיין לא מכרתם כלום... בואו נעלה בגדים
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