import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";

interface CashMeetingProps {
  transactionId: string;
  onMeetingScheduled: () => void;
}

export function CashMeeting({ transactionId, onMeetingScheduled }: CashMeetingProps) {
  const [loading, setLoading] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [location, setLocation] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ 
          status: "meeting_scheduled",
        })
        .eq("id", transactionId);

      if (error) throw error;

      toast({
        title: "פגישה נקבעה",
        description: "תאם את הפרטים עם המוכר בצ'אט",
      });

      onMeetingScheduled();
    } catch (error: any) {
      console.error("Error scheduling meeting:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לקבוע פגישה",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">תשלום במזומן</h2>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mb-4">
        <p className="text-sm">
          בחרת לשלם במזומן במפגש אישי. קבע עם המוכר מקום ומועד בטוחים להיפגש.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="date">תאריך מוצע</Label>
          <Input
            id="date"
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="time">שעה מוצעת</Label>
          <Input
            id="time"
            type="time"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="location">מקום מוצע</Label>
          <Textarea
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="לדוגמה: קניון עזריאלי, קומה 1 ליד הכניסה הראשית"
          />
        </div>

        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full"
        >
          <MapPin className="w-4 h-4 ml-2" />
          אשר פגישה במזומן
        </Button>

        <div className="bg-muted p-3 rounded text-xs">
          <p className="font-semibold mb-1">⚠️ הערת בטיחות:</p>
          <p>
            YOYO אינה מטפלת במזומן או מבטיחה תשלומים במזומן. 
            היפגשו במקומות ציבוריים ובטוחים, רצוי בשעות היום.
          </p>
        </div>
      </div>
    </Card>
  );
}
