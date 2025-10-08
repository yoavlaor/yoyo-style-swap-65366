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
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">הפרופיל שלי</h1>
          <Button variant="outline" onClick={handleSignOut}>
            התנתק
          </Button>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">פרטים</TabsTrigger>
            <TabsTrigger value="items">המוצרים שלי</TabsTrigger>
            <TabsTrigger value="purchases">הרכישות שלי</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>עריכת פרופיל</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">שם משתמש</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">שם מלא</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">אודות</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button type="submit">שמור שינויים</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>המוצרים שלי ({myItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-muted-foreground">₪{item.price}</p>
                        <p className="text-sm">
                          {item.is_sold ? "נמכר ✓" : "פעיל"}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                  {myItems.length === 0 && (
                    <p className="text-muted-foreground">עדיין לא העלית מוצרים</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <CardTitle>הרכישות שלי ({myPurchases.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myPurchases.map((transaction) => (
                    <Card key={transaction.id}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{transaction.items?.title}</h3>
                        <p className="text-muted-foreground">₪{transaction.amount}</p>
                        <p className="text-sm">סטטוס: {transaction.status}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {myPurchases.length === 0 && (
                    <p className="text-muted-foreground">עדיין לא ביצעת רכישות</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;