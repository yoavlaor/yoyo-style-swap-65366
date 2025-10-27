import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistance } from "@/hooks/useGeolocation";

interface ProductCardProps {
  id?: string;
  sellerId?: string;
  image: string;
  title: string;
  brand: string;
  price: number;
  location: string;
  verified?: boolean;
  distance?: number | null;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

export const ProductCard = ({ 
  id,
  sellerId,
  image, 
  title, 
  brand, 
  price, 
  location, 
  verified = false,
  distance = null,
  isAdmin = false,
  onDelete
}: ProductCardProps) => {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  return (
    <Card className="group overflow-hidden border-border/50 bg-card hover:shadow-glow transition-all duration-500 hover:scale-[1.005] rounded-3xl">
      <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => id && navigate(`/checkout/${id}`)}>
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Like Button - Top Right */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-200 hover:scale-110 shadow-glow z-10"
        >
          <Heart 
            className={`h-5 w-5 transition-all duration-200 ${liked ? 'fill-accent text-accent' : 'text-foreground'}`} 
          />
        </button>

        {/* Admin Delete Button */}
        {isAdmin && onDelete && id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("האם אתה בטוח שברצונך למחוק פריט זה?")) {
                onDelete(id);
              }
            }}
            className="absolute top-3 left-3 p-2.5 rounded-full bg-red-500/95 backdrop-blur-md hover:bg-red-600 transition-all duration-200 hover:scale-110 shadow-glow z-10"
          >
            <Trash2 className="h-5 w-5 text-white" />
          </button>
        )}
      </div>

      {/* Content - Below Image */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-bold text-lg text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground font-medium">{brand}</p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sellerId && navigate(`/seller/${sellerId}`);
                  }}
                  className="hover:text-foreground hover:underline transition-colors"
                >
                  {location}
                </button>
              </div>
              {distance !== null && (
                <span className="text-primary font-semibold">• {formatDistance(distance)}</span>
              )}
            </div>
          </div>
          
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-black text-foreground">₪{price}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
