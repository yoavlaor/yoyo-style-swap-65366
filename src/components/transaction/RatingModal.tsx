import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface RatingModalProps {
  transactionId: string;
  fromUserId: string;
  toUserId: string;
  toUsername: string;
  onClose: () => void;
}

export function RatingModal({ 
  transactionId, 
  fromUserId, 
  toUserId, 
  toUsername,
  onClose 
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "בחר דירוג",
        description: "אנא בחר דירוג כוכבים",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("transaction_ratings")
        .insert({
          transaction_id: transactionId,
          from_user_id: fromUserId,
          to_user_id: toUserId,
          score: rating,
          comment: comment || null,
        });

      if (error) throw error;

      toast({
        title: "תודה על הדירוג!",
        description: "הדירוג שלך נשמר בהצלחה",
      });

      onClose();
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור דירוג",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">דרג את החוויה שלך</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-sm mb-4">איך היתה החוויה שלך עם {toUsername}?</p>
            
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="הוסף תגובה (אופציונלי)"
              className="resize-none"
              rows={4}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="w-full"
          >
            שלח דירוג
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
