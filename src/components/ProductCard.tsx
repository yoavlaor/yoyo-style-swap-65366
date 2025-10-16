import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id?: string;
  sellerId?: string;
  image: string;
  title: string;
  brand: string;
  price: number;
  location: string;
  verified?: boolean;
  distance?: string;
  shippingMethods?: string[];
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
  distance = "2 km away",
  shippingMethods = [],
  isAdmin = false,
  onDelete
}: ProductCardProps) => {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  return (
    <Card className="group overflow-hidden border-border/50 bg-card hover:shadow-glow transition-all duration-500 hover:scale-[1.01] rounded-3xl">
      <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => id && navigate(`/checkout/${id}`)}>
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Vibrant Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/0 to-primary/0" />
        
        {/* Like Button - Top Right */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-4 right-4 p-3 rounded-full bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-200 hover:scale-110 shadow-glow z-10"
        >
          <Heart 
            className={`h-6 w-6 transition-all duration-200 ${liked ? 'fill-accent text-accent' : 'text-foreground'}`} 
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
            className="absolute top-4 left-4 p-3 rounded-full bg-red-500/95 backdrop-blur-md hover:bg-red-600 transition-all duration-200 hover:scale-110 shadow-glow z-10"
          >
            <Trash2 className="h-6 w-6 text-white" />
          </button>
        )}

        {/* Content Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-bold text-3xl truncate drop-shadow-lg">{title}</h3>
              <p className="text-lg text-white/90 font-medium">{brand}</p>
              
              <div className="flex items-center gap-2 text-base text-white/80 mt-2">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sellerId && navigate(`/seller/${sellerId}`);
                  }}
                  className="hover:text-white hover:underline transition-colors truncate"
                >
                  {location}
                </button>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0">
              <div className="text-4xl font-black text-white drop-shadow-lg">₪{price}</div>
            </div>
          </div>

          {shippingMethods && shippingMethods.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {shippingMethods.map((method, index) => (
                <Badge key={index} className="text-sm px-3 py-1 bg-secondary/95 text-white border-0 backdrop-blur-md shadow-glow">
                  {method}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
