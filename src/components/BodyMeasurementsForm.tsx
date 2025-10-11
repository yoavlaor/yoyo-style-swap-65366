import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Ruler } from "lucide-react";

interface BodyMeasurementsFormProps {
  userId: string;
  initialData?: {
    height?: number;
    weight?: number;
    bodyType?: string;
    chestSize?: number;
    waistSize?: number;
    hipSize?: number;
  };
  onSave?: () => void;
}

export const BodyMeasurementsForm = ({ userId, initialData, onSave }: BodyMeasurementsFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState({
    height: initialData?.height?.toString() || "",
    weight: initialData?.weight?.toString() || "",
    bodyType: initialData?.bodyType || "",
    chestSize: initialData?.chestSize?.toString() || "",
    waistSize: initialData?.waistSize?.toString() || "",
    hipSize: initialData?.hipSize?.toString() || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          height: measurements.height ? parseFloat(measurements.height) : null,
          weight: measurements.weight ? parseFloat(measurements.weight) : null,
          body_type: measurements.bodyType || null,
          chest_size: measurements.chestSize ? parseFloat(measurements.chestSize) : null,
          waist_size: measurements.waistSize ? parseFloat(measurements.waistSize) : null,
          hip_size: measurements.hipSize ? parseFloat(measurements.hipSize) : null,
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "המידות נשמרו בהצלחה! ✨",
        description: "הבובה הוירטואלית שלך מוכנה",
      });

      onSave?.();
    } catch (error) {
      console.error('Error saving measurements:', error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לשמור את המידות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">מידות הגוף שלי 📏</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">גובה (ס"מ)</Label>
            <Input
              id="height"
              type="number"
              placeholder="170"
              value={measurements.height}
              onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">משקל (ק"ג)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="65"
              value={measurements.weight}
              onChange={(e) => setMeasurements({ ...measurements, weight: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyType">מבנה גוף</Label>
            <Select value={measurements.bodyType} onValueChange={(value) => setMeasurements({ ...measurements, bodyType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="בחרו מבנה גוף" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slim">רזה</SelectItem>
                <SelectItem value="athletic">אתלטי</SelectItem>
                <SelectItem value="average">ממוצע</SelectItem>
                <SelectItem value="curvy">מעוגל</SelectItem>
                <SelectItem value="plus">פלוס סייז</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chestSize">היקף חזה (ס"מ)</Label>
            <Input
              id="chestSize"
              type="number"
              placeholder="90"
              value={measurements.chestSize}
              onChange={(e) => setMeasurements({ ...measurements, chestSize: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="waistSize">היקף מותניים (ס"מ)</Label>
            <Input
              id="waistSize"
              type="number"
              placeholder="70"
              value={measurements.waistSize}
              onChange={(e) => setMeasurements({ ...measurements, waistSize: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hipSize">היקף ירכיים (ס"מ)</Label>
            <Input
              id="hipSize"
              type="number"
              placeholder="95"
              value={measurements.hipSize}
              onChange={(e) => setMeasurements({ ...measurements, hipSize: e.target.value })}
            />
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-right">
          <p className="text-muted-foreground">
            💡 <strong>טיפ:</strong> מידות מדויקות יעזרו לבובה הוירטואלית להציג בצורה מדויקת יותר איך בגדים יתאימו לכם
          </p>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "שומר..." : "שמור מידות ✨"}
        </Button>
      </div>
    </Card>
  );
};
