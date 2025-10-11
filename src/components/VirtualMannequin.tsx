import { User } from "lucide-react";
import { Card } from "@/components/ui/card";

interface VirtualMannequinProps {
  height?: number;
  weight?: number;
  bodyType?: string;
  chestSize?: number;
  waistSize?: number;
  hipSize?: number;
}

export const VirtualMannequin = ({
  height,
  weight,
  bodyType,
  chestSize,
  waistSize,
  hipSize,
}: VirtualMannequinProps) => {
  const hasData = height || weight || bodyType;

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">הבובה הוירטואלית שלי 👗</h3>
        
        {hasData ? (
          <div className="space-y-6">
            {/* Visual representation - placeholder for future AI integration */}
            <div className="flex justify-center">
              <div className="relative w-48 h-64 bg-gradient-to-b from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                <User className="w-24 h-24 text-primary/40" />
                <div className="absolute bottom-2 text-xs text-muted-foreground">
                  {bodyType && <span className="block">{bodyType}</span>}
                </div>
              </div>
            </div>

            {/* Measurements display */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {height && (
                <div className="text-right">
                  <span className="text-muted-foreground">גובה:</span>
                  <span className="font-semibold mr-2">{height} ס"מ</span>
                </div>
              )}
              {weight && (
                <div className="text-right">
                  <span className="text-muted-foreground">משקל:</span>
                  <span className="font-semibold mr-2">{weight} ק"ג</span>
                </div>
              )}
              {chestSize && (
                <div className="text-right">
                  <span className="text-muted-foreground">חזה:</span>
                  <span className="font-semibold mr-2">{chestSize} ס"מ</span>
                </div>
              )}
              {waistSize && (
                <div className="text-right">
                  <span className="text-muted-foreground">מותניים:</span>
                  <span className="font-semibold mr-2">{waistSize} ס"מ</span>
                </div>
              )}
              {hipSize && (
                <div className="text-right">
                  <span className="text-muted-foreground">ירכיים:</span>
                  <span className="font-semibold mr-2">{hipSize} ס"מ</span>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              🤖 תכונת המדידה הוירטואלית תופעל בעתיד עם בינה מלאכותית מתקדמת
            </p>
          </div>
        ) : (
          <div className="py-8">
            <User className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              הוסיפו את מידות הגוף שלכם כדי ליצור את הבובה הוירטואלית
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
