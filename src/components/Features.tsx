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
    <section className="py-20 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-tech text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-electric">YOYO</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the future of secondhand fashion with cutting-edge technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group p-6 bg-gradient-card border-border/50 hover:border-electric/50 transition-all duration-300 hover:shadow-glow animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`mb-4 inline-flex p-3 rounded-xl bg-${feature.color}/10 group-hover:shadow-glow-${feature.color === 'electric' ? '' : 'mint'} transition-shadow duration-300`}>
                  <Icon className={`h-6 w-6 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
