import { Shield, Sparkles, Leaf, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Verified Sellers",
    description: "Every seller is verified by our AI system to ensure authenticity and reliability.",
    color: "electric"
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Smart recommendations based on your style, size, and preferences.",
    color: "mint"
  },
  {
    icon: Leaf,
    title: "Eco Points",
    description: "Earn rewards for every sustainable purchase and track your environmental impact.",
    color: "mint"
  },
  {
    icon: Zap,
    title: "Instant Matching",
    description: "Find perfect fits with our virtual mannequin technology.",
    color: "electric"
  }
];

export const Features = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Why Choose YOYO?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the joy of sustainable fashion with smart, friendly features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group p-8 bg-card border-border hover:border-terracotta/30 transition-all duration-300 hover:shadow-warm animate-slide-up rounded-3xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-terracotta/10 to-sage/10 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-7 w-7 text-terracotta" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-terracotta transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
