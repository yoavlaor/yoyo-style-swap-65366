import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Wallet, Banknote } from "lucide-react";

interface PaymentMethodSelectorProps {
  transactionId: string;
  onMethodSelected: () => void;
}

export function PaymentMethodSelector({ transactionId, onMethodSelected }: PaymentMethodSelectorProps) {
  const [loading, setLoading] = useState(false);

  const selectMethod = async (method: "bit" | "paybox" | "cash") => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ payment_method: method })
        .eq("id", transactionId);

      if (error) throw error;

      toast({
        title: "שיטת תשלום נבחרה",
        description: `בחרת לשלם באמצעות ${method === "bit" ? "Bit" : method === "paybox" ? "PayBox" : "מזומן"}`,
      });

      onMethodSelected();
    } catch (error: any) {
      console.error("Error selecting payment method:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לבחור שיטת תשלום",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">בחר שיטת תשלום</h2>
      <div className="space-y-3">
        <Button
          onClick={() => selectMethod("bit")}
          disabled={loading}
          className="w-full h-auto py-4 flex items-center justify-start gap-4"
          variant="outline"
        >
          <Smartphone className="w-6 h-6 text-blue-500" />
          <div className="text-right">
            <p className="font-semibold">Bit</p>
            <p className="text-xs text-muted-foreground">העברה מיידית דרך אפליקציית Bit</p>
          </div>
        </Button>

        <Button
          onClick={() => selectMethod("paybox")}
          disabled={loading}
          className="w-full h-auto py-4 flex items-center justify-start gap-4"
          variant="outline"
        >
          <Wallet className="w-6 h-6 text-orange-500" />
          <div className="text-right">
            <p className="font-semibold">PayBox</p>
            <p className="text-xs text-muted-foreground">העברה דרך אפליקציית PayBox</p>
          </div>
        </Button>

        <Button
          onClick={() => selectMethod("cash")}
          disabled={loading}
          className="w-full h-auto py-4 flex items-center justify-start gap-4"
          variant="outline"
        >
          <Banknote className="w-6 h-6 text-green-500" />
          <div className="text-right">
            <p className="font-semibold">מזומן</p>
            <p className="text-xs text-muted-foreground">תשלום במפגש אישי</p>
          </div>
        </Button>
      </div>
    </Card>
  );
}
