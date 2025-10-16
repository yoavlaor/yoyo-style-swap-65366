import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Upload, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const Menu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "להתראות! 👋",
      description: "נתראה בפעם הבאה!",
    });
    navigate("/auth");
  };

  const menuItems = [
    {
      title: "הבית",
      description: "גלו בגדים מדהימים במחירים משתלמים",
      icon: Home,
      path: "/",
      gradient: "from-primary to-primary-glow",
      emoji: "🏠",
    },
    {
      title: "העלאה",
      description: "העלו את הבגדים שלכם למכירה",
      icon: Upload,
      path: "/upload",
      gradient: "from-secondary to-accent",
      emoji: "📸",
    },
    {
      title: "האזור האישי שלי",
      description: "ניהול הפרופיל והפריטים שלכם",
      icon: User,
      path: "/profile",
      gradient: "from-sage to-emerald-600",
      emoji: "👤",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero relative" dir="rtl">
      {/* כפתור להתראות בפינה השמאלית העליונה */}
      {isAuthenticated && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="gap-2 text-sm hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            להתראות
          </Button>
        </div>
      )}

      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-sage bg-clip-text text-transparent animate-fade-in">
            ברוכים הבאים ל-YoYo! ✨
          </h1>
          <p className="text-xl text-muted-foreground">
            לאן תרצו להגיע היום?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {menuItems.map((item, index) => (
            <Card
              key={item.path}
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border/50 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => navigate(item.path)}
            >
              <div className={`h-2 bg-gradient-to-r ${item.gradient}`} />
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-center">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-5xl transform group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                    {item.emoji}
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {item.title}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {item.description}
                  </p>
                </div>
                <Button
                  className={`w-full shadow-warm bg-gradient-to-r ${item.gradient} hover:opacity-90 text-white text-lg py-6`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                  }}
                >
                  בואו נתחיל! 🚀
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {!isAuthenticated && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/auth")}
              className="shadow-warm"
            >
              עדיין לא רשומים? הצטרפו אלינו! 🌟
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
