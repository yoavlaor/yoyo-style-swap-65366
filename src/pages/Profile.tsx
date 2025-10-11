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
import { profileSchema, getUserMessage } from "@/lib/validation";
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
  const [fullName, setFullName] = useState("");
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
      setFullName(data.full_name || "");
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

    // Validate inputs
    const validationResult = profileSchema.safeParse({
      username,
      full_name: fullName,
      bio,
    });

    if (!validationResult.success) {
      toast({
        title: "נתונים לא תקינים",
        description: validationResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        full_name: fullName,
        bio,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "שגיאה",
        description: getUserMessage(error),
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
      <div className="min-h-screen bg-gradient-hero p-4" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-6 py-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              האזור האישי שלי ✨
            </h1>
            <p className="text-muted-foreground">הכל במקום אחד, נוח ופשוט 💚</p>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'}`}>
              <TabsTrigger value="profile">קצת עלי 👤</TabsTrigger>
              <TabsTrigger value="mannequin">הבובה שלי 👗</TabsTrigger>
              <TabsTrigger value="items">מה אני מוכר/ת 👕</TabsTrigger>
              <TabsTrigger value="purchases">מה קניתי 🛍️</TabsTrigger>
              <TabsTrigger value="sales">מה מכרתי 💰</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin">ניהול 👑</TabsTrigger>}
            </TabsList>

            <TabsContent value="profile">
              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>בואו נכיר! 👋</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">איך קוראים לך? ✏️</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="שם משתמש מגניב"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">מה השם המלא? 📛</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="השם המלא שלך"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">ספרו לנו משהו עליכם! 💭</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        placeholder="מה מיוחד בכם? מה אתם אוהבים? שתפו אותנו! ✨"
                        className="bg-background resize-none"
                      />
                    </div>
                    <Button type="submit" className="shadow-warm">שמירה 💚</Button>
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

            <TabsContent value="items">
              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>הבגדים שלי ({myItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myItems.map((item) => (
                      <Card key={item.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-semibold">{item.title}</h3>
                              <p className="text-primary font-bold">₪{item.price}</p>
                              <p className="text-sm flex items-center gap-1">
                                {item.is_sold ? (
                                  <span className="text-secondary">נמכר ✓</span>
                                ) : (
                                  <span className="text-sage">זמין למכירה 🌿</span>
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

            <TabsContent value="purchases">
              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>הקניות שלי ({myPurchases.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myPurchases.map((transaction) => (
                      <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 space-y-2">
                          <h3 className="font-semibold">{transaction.items?.title}</h3>
                          <p className="text-primary font-bold">₪{transaction.amount}</p>
                          <p className="text-sm text-sage">סטטוס: {transaction.status} ✓</p>
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

            <TabsContent value="sales">
              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>המכירות שלי ({mySales.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mySales.map((sale) => (
                      <Card key={sale.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{sale.items?.title}</h3>
                              <p className="text-primary font-bold text-xl">₪{sale.amount}</p>
                            </div>
                            <div className="text-left">
                              <p className="text-sm text-muted-foreground">נמכר ב:</p>
                              <p className="text-sm">{new Date(sale.created_at).toLocaleDateString('he-IL')}</p>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">נקנה על ידי:</span>
                                <p className="font-medium">{sale.profiles?.full_name || sale.profiles?.username || 'לא ידוע'}</p>
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