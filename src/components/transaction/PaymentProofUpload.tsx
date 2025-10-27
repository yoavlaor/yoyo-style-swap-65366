import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Upload } from "lucide-react";

interface PaymentProofUploadProps {
  transactionId: string;
  paymentMethod: string;
  amount: number;
  sellerPaymentInfo: {
    bit_number: string | null;
    paybox_handle: string | null;
  };
  onProofUploaded: () => void;
}

export function PaymentProofUpload({
  transactionId,
  paymentMethod,
  amount,
  sellerPaymentInfo,
  onProofUploaded,
}: PaymentProofUploadProps) {
  const [loading, setLoading] = useState(false);
  const [amountPaid, setAmountPaid] = useState(amount.toString());
  const [targetInfo, setTargetInfo] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const handleOpenApp = () => {
    if (paymentMethod === "bit" && sellerPaymentInfo.bit_number) {
      // Bit deep link (if supported by Bit app)
      window.open(`bit://payment?phone=${sellerPaymentInfo.bit_number}&amount=${amount}`, "_blank");
    } else if (paymentMethod === "paybox" && sellerPaymentInfo.paybox_handle) {
      // PayBox deep link (if supported)
      window.open(`paybox://payment?handle=${sellerPaymentInfo.paybox_handle}&amount=${amount}`, "_blank");
    }
  };

  const handleSubmitProof = async () => {
    if (!targetInfo || !amountPaid) {
      toast({
        title: "שדות חסרים",
        description: "אנא מלא את כל הפרטים",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let screenshotUrl = "";
      
      if (screenshot) {
        const fileExt = screenshot.name.split(".").pop();
        const fileName = `${transactionId}-${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from("item-images")
          .upload(`payment-proofs/${fileName}`, screenshot);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("item-images")
          .getPublicUrl(`payment-proofs/${fileName}`);
        
        screenshotUrl = publicUrl;
      }

      const { error: proofError } = await supabase
        .from("payment_proofs")
        .insert({
          transaction_id: transactionId,
          method: paymentMethod,
          amount_reported_by_buyer: parseFloat(amountPaid),
          seller_payment_target: targetInfo,
          screenshot_url: screenshotUrl,
        });

      if (proofError) throw proofError;

      const { error: statusError } = await supabase
        .from("transactions")
        .update({ status: "waiting_seller_confirmation" })
        .eq("id", transactionId);

      if (statusError) throw statusError;

      toast({
        title: "אישור תשלום נשלח",
        description: "המוכר יאשר את קבלת התשלום בקרוב",
      });

      onProofUploaded();
    } catch (error: any) {
      console.error("Error submitting payment proof:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח אישור תשלום",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const paymentTarget = paymentMethod === "bit" 
    ? sellerPaymentInfo.bit_number 
    : sellerPaymentInfo.paybox_handle;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">
        תשלום ב-{paymentMethod === "bit" ? "Bit" : "PayBox"}
      </h2>
      
      <div className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm mb-2">
            <span className="font-semibold">סכום לתשלום:</span> ₪{amount}
          </p>
          {paymentTarget && (
            <p className="text-sm">
              <span className="font-semibold">העבר אל:</span> {paymentTarget}
            </p>
          )}
        </div>

        {paymentTarget && (
          <Button
            onClick={handleOpenApp}
            variant="outline"
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 ml-2" />
            פתח אפליקציית {paymentMethod === "bit" ? "Bit" : "PayBox"}
          </Button>
        )}

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">אחרי שהעברת את התשלום:</h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="amount">כמה העברת?</Label>
              <Input
                id="amount"
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={`₪${amount}`}
              />
            </div>

            <div>
              <Label htmlFor="target">לאיזה מספר/משתמש העברת?</Label>
              <Input
                id="target"
                value={targetInfo}
                onChange={(e) => setTargetInfo(e.target.value)}
                placeholder={paymentTarget || "הכנס מספר/משתמש"}
              />
            </div>

            <div>
              <Label htmlFor="screenshot">צילום מסך של התשלום (אופציונלי)</Label>
              <div className="mt-2">
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmitProof}
            disabled={loading}
            className="w-full mt-4"
          >
            <Upload className="w-4 h-4 ml-2" />
            ✅ שילמתי
          </Button>

          <p className="text-xs text-muted-foreground mt-3 p-3 bg-muted rounded">
            על ידי סימון "שילמתי", אתה מאשר שהעברת את מלוא הסכום ישירות למוכר. 
            YOYO אינה מטפלת או מבטיחה תשלומים.
          </p>
        </div>
      </div>
    </Card>
  );
}
