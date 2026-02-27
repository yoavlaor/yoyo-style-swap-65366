import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, CheckCircle, XCircle, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ItemAnalysis {
  title?: string;
  description?: string;
  category?: string;
  condition?: string;
  brand?: string;
  gender?: string;
  verified?: boolean;
}

interface ItemVerificationCardProps {
  itemId?: string;
  imagePreviews?: string[];
  onVerificationComplete?: (verified: boolean, analysis?: ItemAnalysis) => void;
}

export const ItemVerificationCard = ({ itemId, imagePreviews, onVerificationComplete }: ItemVerificationCardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [analysis, setAnalysis] = useState<ItemAnalysis | null>(null);

  const handleVerification = async () => {
    if (!imagePreviews || imagePreviews.length === 0) {
      toast({
        title: "אין תמונות",
        description: "העלו תמונה אחת לפחות כדי לאמת את הפריט",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use the first image for AI analysis
      const imageBase64 = imagePreviews[0];

      const { data, error } = await supabase.functions.invoke('verify-item', {
        body: { imageBase64 },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "שגיאה",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setAnalysis(data);
      const verified = data?.verified === true;
      setIsVerified(verified);

      toast({
        title: verified ? "הפריט אומת בהצלחה! ✨" : "הפריט נבדק",
        description: verified
          ? "הבינה המלאכותית זיהתה ותיארה את הפריט. השדות עודכנו אוטומטית!"
          : "הבינה המלאכותית ניתחה את הפריט. ניתן לעדכן שדות ידנית.",
      });

      onVerificationComplete?.(verified, data);
    } catch (error) {
      console.error('Error during verification:', error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לבצע אימות. נסו שוב.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            אימות פריט
            <Sparkles className="w-5 h-5 text-primary" />
          </h3>
          {isVerified ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">מאומת</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="w-5 h-5" />
              <span className="text-sm">לא מאומת</span>
            </div>
          )}
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-right space-y-2">
          <p className="text-muted-foreground">
            <strong>אימות ותיאור אוטומטי באמצעות AI</strong>
          </p>
          <p className="text-muted-foreground">
            העלו תמונה והמערכת תזהה ותמלא אוטומטית:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground mr-4">
            <li>שם הפריט ותיאור מפורט</li>
            <li>קטגוריה, מותג ומצב</li>
            <li>מגדר ואותנטיות</li>
          </ul>
        </div>

        {analysis && (
          <div className="bg-primary/5 rounded-lg p-4 text-sm text-right space-y-1 border border-primary/20">
            <p className="font-bold text-primary mb-2">תוצאת הניתוח:</p>
            {analysis.title && <p><strong>שם:</strong> {analysis.title}</p>}
            {analysis.description && <p><strong>תיאור:</strong> {analysis.description}</p>}
            {analysis.category && <p><strong>קטגוריה:</strong> {analysis.category}</p>}
            {analysis.brand && <p><strong>מותג:</strong> {analysis.brand}</p>}
            {analysis.condition && <p><strong>מצב:</strong> {analysis.condition}</p>}
          </div>
        )}

        {!isVerified && (
          <Button
            onClick={handleVerification}
            disabled={loading || !imagePreviews || imagePreviews.length === 0}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                מנתח את הפריט...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 ml-2" />
                אמת ותאר פריט באמצעות AI
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground">
          {imagePreviews && imagePreviews.length === 0
            ? "העלו תמונה כדי להתחיל את האימות"
            : "פריטים מאומתים מקבלים עדיפות בתוצאות החיפוש"}
        </p>
      </div>
    </Card>
  );
};
