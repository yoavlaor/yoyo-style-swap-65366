import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Upload, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";

const Index = () => {
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
      title: "החנות",
      description: "גלו בגדים מדהימים במחירים משתלמים",
      icon: Home,
      path: "/feed",
      gradient: "from-primary to-accent",
      
    },
    {
      title: "העלאה",
      description: "העלו את הבגדים שלכם למכירה",
      icon: Upload,
      path: "/upload",
      gradient: "from-secondary to-mint",
      
    },
    {
      title: "האזור האישי שלי",
      description: "ניהול הפרופיל והפריטים שלכם",
      icon: User,
      path: "/profile",
      gradient: "from-accent to-primary",
      
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
        {/* Logo & Slogan */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="font-sans text-6xl md:text-8xl font-black mb-6 drop-shadow-2xl">
            <span className="bg-gradient-primary bg-clip-text text-transparent animate-glow-pulse">
              YOYO
            </span>
          </h1>
          
          <div className="space-y-2 mb-8">
            <p className="text-xl md:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                חנות יד שנייה חכמה
              </span>
            </p>
            
            <p className="text-lg md:text-2xl font-semibold text-muted-foreground/90">
              צאו מהארון..
            </p>
          </div>
        </div>

        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
            לאן תרצו להגיע היום?
          </h2>
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
              <CardContent className="p-12 space-y-6">
                <div className="flex justify-center">
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                    <item.icon className="w-16 h-16 text-primary-foreground" />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {item.title}
                  </h2>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!isAuthenticated && (
          <div className="flex justify-center gap-4 mt-16 animate-fade-in">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-xl px-12 py-7 font-bold shadow-glow hover:scale-105 transition-transform"
            >
              כניסה
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-xl px-12 py-7 font-bold shadow-glow hover:scale-105 transition-transform"
            >
              הרשמה
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
