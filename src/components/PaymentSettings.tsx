import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Smartphone, Wallet } from "lucide-react";

interface PaymentSettingsProps {
  userId: string;
}

export function PaymentSettings({ userId }: PaymentSettingsProps) {
  const [bitNumber, setBitNumber] = useState("");
  const [payboxHandle, setPayboxHandle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPaymentSettings();
  }, [userId]);

  const loadPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("bit_number, paybox_handle")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (data) {
        setBitNumber(data.bit_number || "");
        setPayboxHandle(data.paybox_handle || "");
      }
    } catch (error: any) {
      console.error("Error loading payment settings:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          bit_number: bitNumber || null,
          paybox_handle: payboxHandle || null,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "נשמר בהצלחה",
        description: "פרטי התשלום שלך עודכנו",
      });
    } catch (error: any) {
      console.error("Error saving payment settings:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את פרטי התשלום",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-glow bg-gradient-to-br from-card to-card/80 backdrop-blur-md border-border/30 rounded-3xl mt-6">
      <CardHeader className="pb-4 sm:pb-8">
        <CardTitle className="text-2xl sm:text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">
          הגדרות תשלום 💳
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>למה זה חשוב?</strong> כשמישהו קונה ממך, המערכת תציג לו את הפרטים האלה כדי שיוכל להעביר לך תשלום
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bit" className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-500" />
                מספר Bit שלך
              </Label>
              <Input
                id="bit"
                type="tel"
                value={bitNumber}
                onChange={(e) => setBitNumber(e.target.value)}
                placeholder="05XXXXXXXX"
                className="bg-background h-12 sm:h-14 text-base sm:text-lg rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all hover:border-primary/40"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                המספר שאליו קונים יעבירו כסף דרך Bit
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paybox" className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Wallet className="w-5 h-5 text-orange-500" />
                שם משתמש PayBox
              </Label>
              <Input
                id="paybox"
                value={payboxHandle}
                onChange={(e) => setPayboxHandle(e.target.value)}
                placeholder="@username"
                className="bg-background h-12 sm:h-14 text-base sm:text-lg rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all hover:border-primary/40"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                שם המשתמש שלך ב-PayBox (אופציונלי)
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="shadow-glow text-base sm:text-lg font-bold px-6 sm:px-8 rounded-2xl hover:scale-105 transition-transform w-full sm:w-auto"
          >
            {loading ? "שומר..." : "שמור הגדרות"}
          </Button>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>חשוב:</strong> YOYO לא מטפלת בתשלומים ולא מעבירה כספים. 
              אנחנו רק מקלים על התקשורת בינך לבין הקונים. וודא שהפרטים נכונים!
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
