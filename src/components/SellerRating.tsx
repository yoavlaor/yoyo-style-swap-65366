import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface SellerRatingProps {
  sellerId: string;
  currentUserId?: string;
}

export const SellerRating = ({ sellerId, currentUserId }: SellerRatingProps) => {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    loadSellerRating();
    if (currentUserId) {
      loadUserRating();
    }
  }, [sellerId, currentUserId]);

  const loadSellerRating = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("average_rating, total_ratings")
      .eq("id", sellerId)
      .single();

    if (data) {
      setAverageRating(data.average_rating || 0);
      setTotalRatings(data.total_ratings || 0);
    }
  };

  const loadUserRating = async () => {
    if (!currentUserId) return;

    const { data } = await supabase
      .from("seller_ratings")
      .select("rating")
      .eq("user_id", currentUserId)
      .eq("seller_id", sellerId)
      .maybeSingle();

    if (data) {
      setUserRating(data.rating);
    }
  };

  const handleRating = async (rating: number) => {
    if (!currentUserId) {
      toast({
        title: "יש להתחבר כדי לדרג",
        description: "אנא התחברו כדי לדרג מוכרים",
        variant: "destructive",
      });
      return;
    }

    if (currentUserId === sellerId) {
      toast({
        title: "לא ניתן לדרג את עצמך",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("seller_ratings")
      .upsert({
        user_id: currentUserId,
        seller_id: sellerId,
        rating,
      }, {
        onConflict: "user_id,seller_id",
      });

    if (error) {
      toast({
        title: "שגיאה בדירוג",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setUserRating(rating);
      toast({
        title: "הדירוג נשמר בהצלחה! ⭐",
      });
      loadSellerRating();
    }
  };

  return (
    <Card className="shadow-card bg-gradient-card border-border/50">
      <CardContent className="p-4 space-y-3" dir="rtl">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">דירוג המוכר</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({averageRating.toFixed(1)} מתוך {totalRatings} דירוגים)
            </span>
          </div>
        </div>

        {!currentUserId && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              יש להתחבר כדי לדרג את המוכר
            </p>
          </div>
        )}

        {currentUserId && currentUserId === sellerId && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              לא ניתן לדרג את עצמך
            </p>
          </div>
        )}

        {currentUserId && currentUserId !== sellerId && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <p className="text-sm font-medium">הדירוג שלך:</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 cursor-pointer ${
                      star <= (hoveredRating || userRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>
            {userRating > 0 && (
              <p className="text-xs text-muted-foreground">
                דירגת {userRating} כוכבים
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
