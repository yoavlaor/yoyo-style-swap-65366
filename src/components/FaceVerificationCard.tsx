import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, CheckCircle, XCircle } from "lucide-react";

interface FaceVerificationCardProps {
  userId: string;
  isVerified: boolean;
  onVerificationChange?: () => void;
}

export const FaceVerificationCard = ({ userId, isVerified, onVerificationChange }: FaceVerificationCardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleVerification = async () => {
    setLoading(true);
    try {
      // TODO: In the future, integrate with AI face verification service
      // For now, this is a placeholder that simulates the verification process
      
      toast({
        title: "תכונה בפיתוח 🚧",
        description: "אימות הפנים באמצעות בינה מלאכותית יהיה זמין בקרוב!",
      });

      // Placeholder for future AI integration:
      // const { error } = await supabase
      //   .from('profiles')
      //   .update({ is_face_verified: true })
      //   .eq('id', userId);
      
      // if (error) throw error;
      // onVerificationChange?.();
      
    } catch (error) {
      console.error('Error during verification:', error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לבצע אימות",
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
          <h3 className="text-xl font-semibold">אימות פנים 🔐</h3>
          {isVerified ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">מאומת ✓</span>
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
            🤖 <strong>אימות באמצעות בינה מלאכותית</strong>
          </p>
          <p className="text-muted-foreground">
            המערכת תבקש ממך לצלם תמונת סלפי ותאמת את זהותך באמצעות טכנולוגיית זיהוי פנים מתקדמת
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground mr-4">
            <li>הגברת אמינות הפרופיל שלך</li>
            <li>תג מאומת על הפרופיל</li>
            <li>עדיפות בתוצאות חיפוש</li>
          </ul>
        </div>

        {!isVerified && (
          <Button 
            onClick={handleVerification} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            <Camera className="w-4 h-4 ml-2" />
            {loading ? "מאמת..." : "התחל אימות פנים"}
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground">
          🔒 התמונה שלך מאובטחת ומוגנת לפי תקני אבטחה מחמירים
        </p>
      </div>
    </Card>
  );
};
