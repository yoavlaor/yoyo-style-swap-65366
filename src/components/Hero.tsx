import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import heroImage from "@/assets/hero-image.jpg";

export const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Sustainable Fashion" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-terracotta/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-sage/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="font-sans text-6xl md:text-8xl lg:text-9xl font-black mb-8 animate-slide-up drop-shadow-2xl">
          <span className="bg-gradient-to-r from-terracotta via-sage to-warmYellow bg-clip-text text-transparent animate-glow-pulse">
            יויו
          </span>
        </h1>

        <div className="space-y-3 mb-8">
          <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 max-w-4xl mx-auto animate-slide-up tracking-tight" style={{ animationDelay: "0.1s" }}>
            <span className="bg-gradient-to-l from-terracotta via-sage to-terracotta bg-clip-text text-transparent">
              אמינות · חדשנות · אקולוגיה
            </span>
          </p>

          <p className="text-lg md:text-2xl lg:text-3xl font-semibold text-muted-foreground/90 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
            ✨ משנים את כללי המשחק ✨
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
          {user ? (
            <>
              <Button 
                size="lg"
                onClick={() => navigate("/upload")}
                className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground shadow-warm transition-all duration-300 group rounded-full px-8"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                בואו נמכור משהו 🎉
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/profile")}
                className="border-2 border-sage text-sage hover:bg-sage hover:text-white transition-all duration-300 rounded-full px-8"
              >
                האזור האישי שלי 👤
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground shadow-warm transition-all duration-300 group rounded-full px-8"
              >
                בואו נתחיל! ✨
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-2 border-sage text-sage hover:bg-sage hover:text-white transition-all duration-300 rounded-full px-8"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                הצטרפו עכשיו 🌟
              </Button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-terracotta mb-2">10K+</div>
            <div className="text-sm text-muted-foreground">בגדים מאושרים 👕</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-sage mb-2">5K+</div>
            <div className="text-sm text-muted-foreground">משתמשים מאושרים 💚</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-terracotta mb-2">98%</div>
            <div className="text-sm text-muted-foreground">שביעות רצון 😊</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-terracotta rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-terracotta rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
