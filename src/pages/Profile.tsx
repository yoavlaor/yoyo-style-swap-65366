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
import Navbar from "@/components/Navbar";

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        loadMyItems(session.user.id);
        loadMyPurchases(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
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
      setUsername(data.username || "");
      setFullName(data.full_name || "");
      setBio(data.bio || "");
    }
    setLoading(false);
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
              הפרופיל שלי 🌿
            </h1>
            <p className="text-muted-foreground">נהל את הפרטים והבגדים שלך בקהילה</p>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">הפרטים שלי 👤</TabsTrigger>
              <TabsTrigger value="items">הבגדים שלי 👕</TabsTrigger>
              <TabsTrigger value="purchases">הקניות שלי 🛍️</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>ערכו את הפרופיל שלכם</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">שם משתמש</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">שם מלא</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">ספרו קצת על עצמכם 📝</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        placeholder="מה מניע אתכם? מה אתם אוהבים?"
                        className="bg-background resize-none"
                      />
                    </div>
                    <Button type="submit" className="shadow-warm">שמרו שינויים 💚</Button>
                  </form>
                </CardContent>
              </Card>
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
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-primary font-bold">₪{item.price}</p>
                          <p className="text-sm flex items-center gap-1">
                            {item.is_sold ? (
                              <span className="text-secondary">נמכר ✓</span>
                            ) : (
                              <span className="text-muted-foreground">פעיל 🌿</span>
                            )}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                    {myItems.length === 0 && (
                      <p className="text-muted-foreground col-span-2 text-center py-8">
                        עדיין לא העלתם בגדים 🌱
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
                          <p className="text-sm text-secondary">סטטוס: {transaction.status} ✓</p>
                        </CardContent>
                      </Card>
                    ))}
                    {myPurchases.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        עדיין לא ביצעתם קניות 🛍️
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Profile;