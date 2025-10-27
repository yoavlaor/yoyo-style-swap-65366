import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { ShoppingBag, User as UserIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { VirtualMannequin } from "@/components/VirtualMannequin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Checkout = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [item, setItem] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadItem();
        loadUserProfile(session.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [itemId, navigate]);

  const loadItem = async () => {
    const { data, error } = await supabase
      .from("items")
      .select("*, profiles(*)")
      .eq("id", itemId)
      .single();

    if (data) {
      setItem(data);
    }
    setLoading(false);
  };

  const loadUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (data) {
      setUserProfile(data);
    }
  };

  const handlePurchase = async () => {
    if (!user || !item) return;

    if (!selectedShippingMethod) {
      toast({
        title: "יש לבחור אופציית משלוח",
        description: "אנא בחר את דרך המשלוח המועדפת עליך",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        item_id: item.id,
        buyer_id: user.id,
        seller_id: item.seller_id,
        amount: item.price,
        status: "completed",
        shipping_method: selectedShippingMethod,
      })
      .select()
      .single();

    if (transactionError) {
      toast({
        title: "שגיאה בתשלום",
        description: transactionError.message,
        variant: "destructive",
      });
      setProcessing(false);
      return;
    }

    // Mark item as sold
    await supabase
      .from("items")
      .update({ is_sold: true })
      .eq("id", item.id);

    // Create chat
    const { data: chat } = await supabase
      .from("chats")
      .insert({
        item_id: item.id,
        buyer_id: user.id,
        seller_id: item.seller_id,
      })
      .select()
      .single();

    toast({
      title: "הרכישה בוצעה בהצלחה! 🎉",
      description: "תודה על התרומה לקהילה הירוקה שלנו 🌿",
    });

    // Open BitPay link
    window.open("https://www.bitpay.co.il/he", "_blank");
    
    // Navigate to chat
    setTimeout(() => {
      if (chat) {
        navigate(`/chat/${chat.id}`);
      } else {
        navigate("/profile");
      }
    }, 500);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  if (!item) {
    return <div className="min-h-screen flex items-center justify-center">מוצר לא נמצא</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-hero p-4 pb-24" dir="rtl">
        <div className="max-w-2xl mx-auto py-8">
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-warm">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">סיכום הקנייה 🛍️</CardTitle>
              <p className="text-muted-foreground">עוד רגע הבגד יהיה שלכם!</p>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">מותג:</span>
                  <span className="mr-2">{item.brand || "לא צוין"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">מידה:</span>
                  <span className="mr-2">{item.size || "לא צוין"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">מצב:</span>
                  <span className="mr-2">{item.condition || "לא צוין"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">מוכר:</span>
                  <button
                    onClick={() => navigate(`/seller/${item.seller_id}`)}
                    className="mr-2 text-primary hover:underline"
                  >
                    {item.profiles?.username}
                  </button>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">בחר אופציית משלוח:</h4>
                  <div className="space-y-2">
                    {item.shipping_method?.map((method: string) => (
                      <label
                        key={method}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={method}
                          checked={selectedShippingMethod === method}
                          onChange={(e) => setSelectedShippingMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xl font-bold pt-2">
                  <span>סה"כ לתשלום:</span>
                  <span>₪{item.price}</span>
                </div>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mb-4">
                  <UserIcon className="w-4 h-4 ml-2" />
                  מדוד על הבובה שלי 👗
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-right">מדידה וירטואלית</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {userProfile?.height || userProfile?.weight ? (
                    <>
                      <VirtualMannequin
                        height={userProfile?.height}
                        weight={userProfile?.weight}
                        bodyType={userProfile?.body_type}
                      />
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-right">
                        <p className="text-yellow-800">
                          🤖 <strong>תכונה בפיתוח:</strong> בעתיד תוכלו לראות את הפריט על הבובה שלכם בצורה מדויקת באמצעות בינה מלאכותית
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        כדי להשתמש בתכונה זו, יש להוסיף את מידות הגוף בפרופיל שלכם
                      </p>
                      <Button onClick={() => navigate('/profile')}>
                        עבור לפרופיל
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex gap-4">
              <Button
                onClick={handlePurchase}
                disabled={processing}
                className="flex-1"
              >
                {processing ? "מעבד..." : "אשר רכישה"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                ביטול
              </Button>
            </div>

              <p className="text-sm text-muted-foreground text-center">
                לאחר הרכישה, תוכלו לתקשר עם המוכר דרך הצ'אט 💬
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Checkout;