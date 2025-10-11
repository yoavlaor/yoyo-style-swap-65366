import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import mannequinImage from "@/assets/mannequin-wave.png";

interface VirtualMannequinProps {
  height?: number;
  weight?: number;
  bodyType?: string;
}

export const VirtualMannequin = ({
  height,
  weight,
  bodyType,
}: VirtualMannequinProps) => {
  const hasData = height || weight || bodyType;

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">הבובה הוירטואלית שלי 👗</h3>
        
        {hasData ? (
          <div className="space-y-6">
            {/* Visual representation with mannequin image */}
            <div className="flex justify-center">
              <div className="relative w-48 h-64 bg-gradient-to-b from-primary/10 to-primary/5 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={mannequinImage} 
                  alt="בובת ראווה" 
                  className="w-full h-full object-contain animate-fade-in"
                />
                {bodyType && (
                  <div className="absolute bottom-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {bodyType}
                  </div>
                )}
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
              {bodyType && (
                <div className="text-right col-span-2">
                  <span className="text-muted-foreground">מבנה גוף:</span>
                  <span className="font-semibold mr-2">{bodyType}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              🤖 תכונת המדידה הוירטואלית תופעל בעתיד עם בינה מלאכותית מתקדמת
            </p>
          </div>
        ) : (
          <div className="py-8">
            <div className="mb-4 flex justify-center">
              <img 
                src={mannequinImage} 
                alt="בובת ראווה" 
                className="w-32 h-32 object-contain opacity-40 grayscale"
              />
            </div>
            <p className="text-muted-foreground">
              הוסיפו את מידות הגוף שלכם כדי ליצור את הבובה הוירטואלית
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
