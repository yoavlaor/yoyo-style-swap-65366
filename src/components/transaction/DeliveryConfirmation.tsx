import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle } from "lucide-react";

interface DeliveryConfirmationProps {
  transactionId: string;
  isBuyer: boolean;
  isSeller: boolean;
  onConfirmed: () => void;
}

export function DeliveryConfirmation({ 
  transactionId, 
  isBuyer, 
  isSeller,
  onConfirmed 
}: DeliveryConfirmationProps) {
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState<any>(null);

  useEffect(() => {
    loadDeliveryStatus();
  }, [transactionId]);

  const loadDeliveryStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_confirmations")
        .select("*")
        .eq("transaction_id", transactionId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      setDelivery(data);
    } catch (error: any) {
      console.error("Error loading delivery status:", error);
    }
  };

  const handleConfirmDelivery = async (type: "seller" | "buyer") => {
    setLoading(true);
    try {
      if (!delivery) {
        // Create new delivery confirmation
        const { error: insertError } = await supabase
          .from("delivery_confirmations")
          .insert({
            transaction_id: transactionId,
            seller_delivered: type === "seller",
            buyer_received_ok: type === "buyer",
          });

        if (insertError) throw insertError;
      } else {
        // Update existing delivery confirmation
        const updateData = type === "seller" 
          ? { seller_delivered: true }
          : { buyer_received_ok: true };

        const { error: updateError } = await supabase
          .from("delivery_confirmations")
          .update(updateData)
          .eq("transaction_id", transactionId);

        if (updateError) throw updateError;
      }

      toast({
        title: "אושר",
        description: type === "seller" 
          ? "סומן כ'נמסר לקונה'"
          : "תודה על האישור! העסקה הושלמה",
      });

      await loadDeliveryStatus();
      onConfirmed();
    } catch (error: any) {
      console.error("Error confirming delivery:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לאשר מסירה",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">אישור מסירה</h2>
      
      <div className="space-y-4">
        {isSeller && (
          <div>
            <p className="mb-3 text-sm">
              {delivery?.seller_delivered 
                ? "✅ סימנת שמסרת את המוצר"
                : "האם מסרת את המוצר לקונה?"}
            </p>
            <Button
              onClick={() => handleConfirmDelivery("seller")}
              disabled={loading || delivery?.seller_delivered}
              className="w-full"
            >
              <Package className="w-4 h-4 ml-2" />
              {delivery?.seller_delivered ? "המוצר נמסר" : "מסרתי את המוצר לקונה"}
            </Button>
          </div>
        )}

        {isBuyer && (
          <div>
            <p className="mb-3 text-sm">
              {delivery?.buyer_received_ok
                ? "✅ אישרת קבלת המוצר"
                : "האם קיבלת את המוצר?"}
            </p>
            <Button
              onClick={() => handleConfirmDelivery("buyer")}
              disabled={loading || delivery?.buyer_received_ok}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 ml-2" />
              {delivery?.buyer_received_ok ? "המוצר נתקבל" : "קיבלתי את המוצר"}
            </Button>
          </div>
        )}

        {delivery?.seller_delivered && delivery?.buyer_received_ok && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-700 dark:text-green-400">
              העסקה הושלמה בהצלחה! 🎉
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
