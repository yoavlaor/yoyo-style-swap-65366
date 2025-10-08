import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

const Checkout = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadItem();
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

  const handlePurchase = async () => {
    if (!user || !item) return;

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
      title: "הרכישה בוצעה בהצלחה!",
      description: "נפתח עבורך צ'אט עם המוכר",
    });

    if (chat) {
      navigate(`/chat/${chat.id}`);
    } else {
      navigate("/profile");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  if (!item) {
    return <div className="min-h-screen flex items-center justify-center">מוצר לא נמצא</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">סיכום הזמנה</CardTitle>
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
                  <span className="mr-2">{item.profiles?.username}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>סה"כ לתשלום:</span>
                  <span>₪{item.price}</span>
                </div>
              </div>
            </div>

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
              לאחר הרכישה, תוכל לתקשר עם המוכר דרך הצ'אט
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;