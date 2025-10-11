import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id?: string;
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
    <Card className="group overflow-hidden border-border bg-card hover:shadow-warm transition-all duration-300 hover:scale-[1.02] rounded-3xl">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Like Button */}
        <button 
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 hover:scale-110 shadow-soft"
        >
          <Heart 
            className={`h-5 w-5 transition-all duration-200 ${liked ? 'fill-terracotta text-terracotta' : 'text-foreground'}`} 
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
            className="absolute top-3 left-3 p-2 rounded-full bg-red-500/90 backdrop-blur-sm hover:bg-red-600 transition-all duration-200 hover:scale-110 shadow-soft"
          >
            <Trash2 className="h-5 w-5 text-white" />
          </button>
        )}

        {/* Verified Badge */}
        {verified && (
          <Badge className="absolute top-3 left-3 bg-sage/95 text-white backdrop-blur-sm border-0 shadow-soft">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )}

        {/* Quick Actions - Show on Hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Button
            onClick={() => id && navigate(`/checkout/${id}`)}
            className="w-full bg-terracotta/95 hover:bg-terracotta text-white backdrop-blur-sm shadow-warm rounded-full"
          >
            קנה עכשיו
          </Button>
        </div>
      </div>

      <div className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{brand}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-terracotta">₪{price}</div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-sage" />
          <span>{location}</span>
          <span className="text-xs">• {distance}</span>
        </div>
        
        {shippingMethods && shippingMethods.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {shippingMethods.map((method) => {
              const methodLabels: Record<string, string> = {
                "face-to-face": "פנים אל פנים 👥",
                "digital-stamp": "בול דיגיטלי 📬",
                "yoyo-station": "תחנת YOYO 🏪"
              };
              return (
                <Badge key={method} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                  {methodLabels[method] || method}
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
