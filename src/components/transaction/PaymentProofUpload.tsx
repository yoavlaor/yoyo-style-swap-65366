import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "הועתק ללוח",
      description: `${label} הועתק בהצלחה`,
    });
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
        <div className="bg-primary/5 border-2 border-primary/20 p-4 rounded-lg space-y-3">
          <h3 className="font-semibold text-lg">פרטי התשלום:</h3>
          
          <div className="flex items-center justify-between bg-background p-3 rounded">
            <div>
              <p className="text-xs text-muted-foreground">סכום לתשלום</p>
              <p className="text-xl font-bold">₪{amount}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(amount.toString(), "הסכום")}
            >
              העתק
            </Button>
          </div>

          {paymentTarget && (
            <div className="flex items-center justify-between bg-background p-3 rounded">
              <div>
                <p className="text-xs text-muted-foreground">
                  {paymentMethod === "bit" ? "מספר טלפון" : "שם משתמש"}
                </p>
                <p className="text-lg font-semibold">{paymentTarget}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(paymentTarget, paymentMethod === "bit" ? "מספר הטלפון" : "שם המשתמש")}
              >
                העתק
              </Button>
            </div>
          )}

          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded text-sm">
            <p className="font-semibold mb-1">📱 הוראות:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>פתח את אפליקציית {paymentMethod === "bit" ? "Bit" : "PayBox"}</li>
              <li>בחר "העברת כסף" או "תשלום"</li>
              <li>הזן את {paymentMethod === "bit" ? "מספר הטלפון" : "שם המשתמש"} והסכום</li>
              <li>אשר את התשלום</li>
              <li>חזור לכאן ומלא את הפרטים למטה</li>
            </ol>
          </div>
        </div>

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
