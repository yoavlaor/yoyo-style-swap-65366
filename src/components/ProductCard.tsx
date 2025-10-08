import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  image: string;
  title: string;
  brand: string;
  price: number;
  location: string;
  verified?: boolean;
  distance?: string;
}

export const ProductCard = ({ 
  image, 
  title, 
  brand, 
  price, 
  location, 
  verified = false,
  distance = "2 km away"
}: ProductCardProps) => {
  const [liked, setLiked] = useState(false);

  return (
    <Card className="group overflow-hidden border-border/50 bg-gradient-card hover:shadow-card transition-all duration-300 hover:scale-[1.02]">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Like Button */}
        <button 
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-200 hover:scale-110"
        >
          <Heart 
            className={`h-5 w-5 transition-all duration-200 ${liked ? 'fill-electric text-electric' : 'text-foreground'}`} 
          />
        </button>

        {/* Verified Badge */}
        {verified && (
          <Badge className="absolute top-3 left-3 bg-mint/90 text-primary-foreground backdrop-blur-sm border-0 shadow-glow-mint">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )}

        {/* Quick Actions - Show on Hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Button className="w-full bg-electric/90 hover:bg-electric text-primary-foreground backdrop-blur-sm shadow-glow">
            Try On Mannequin
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{brand}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-electric">₪{price}</div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-mint" />
          <span>{location}</span>
          <span className="text-xs">• {distance}</span>
        </div>
      </div>
    </Card>
  );
};
