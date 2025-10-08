import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import yoyoLogo from "@/assets/yoyo-logo.png";

export const Hero = () => {
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
        <div className="flex justify-center mb-8 animate-slide-up">
          <img 
            src={yoyoLogo} 
            alt="YOYO Logo" 
            className="w-32 h-32 md:w-40 md:h-40 drop-shadow-glow animate-glow-pulse"
          />
        </div>

        <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <span className="bg-gradient-to-r from-terracotta via-sage to-warmYellow bg-clip-text text-transparent">
            YOYO
          </span>
        </h1>

        <p className="text-xl md:text-2xl lg:text-3xl text-foreground/90 mb-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
          AI-Powered Secondhand Fashion
        </p>

        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
          Smart. Verified. Sustainable. The future of fashion is circular.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <Button 
            size="lg" 
            className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground shadow-warm transition-all duration-300 group rounded-full px-8"
          >
            Start Shopping
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-sage text-sage hover:bg-sage hover:text-white transition-all duration-300 rounded-full px-8"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Sell Your Items
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16 animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-terracotta mb-2">10K+</div>
            <div className="text-sm text-muted-foreground">Verified Items</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-sage mb-2">5K+</div>
            <div className="text-sm text-muted-foreground">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-terracotta mb-2">98%</div>
            <div className="text-sm text-muted-foreground">Satisfaction</div>
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
