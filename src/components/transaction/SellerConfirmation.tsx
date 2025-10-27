import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface SellerConfirmationProps {
  transactionId: string;
  onConfirmed: () => void;
}

export function SellerConfirmation({ transactionId, onConfirmed }: SellerConfirmationProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (received: boolean) => {
    setLoading(true);
    try {
      const newStatus = received ? "ready_to_deliver" : "payment_disputed";
      
      const { error } = await supabase
        .from("transactions")
        .update({ status: newStatus })
        .eq("id", transactionId);

      if (error) throw error;

      toast({
        title: received ? "תשלום אושר" : "תשלום לא אושר",
        description: received 
          ? "כעת תוכל להעביר את המוצר לקונה"
          : "סומן כמחלוקת - אנא תקשרו בצ'אט לפתרון",
        variant: received ? "default" : "destructive",
      });

      onConfirmed();
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לאשר תשלום",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">אישור קבלת תשלום</h2>
      
      <p className="mb-6">
        הקונה טוען שהעביר לך את התשלום. האם קיבלת את הכסף?
      </p>

      <div className="space-y-3">
        <Button
          onClick={() => handleConfirm(true)}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 ml-2" />
          כן, קיבלתי את התשלום
        </Button>

        <Button
          onClick={() => handleConfirm(false)}
          disabled={loading}
          variant="destructive"
          className="w-full"
        >
          <XCircle className="w-4 h-4 ml-2" />
          לא, עדיין לא קיבלתי
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded">
        על ידי אישור קבלת התשלום, אתה מצהיר שקיבלת את מלוא התשלום מהקונה. 
        YOYO אינה מעבירה או שומרת כספים.
      </p>
    </Card>
  );
}
