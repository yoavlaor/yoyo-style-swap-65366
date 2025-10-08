import { Leaf, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

export const EcoImpact = () => {
  return (
    <section className="py-20 px-4 bg-gradient-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-mint rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-electric rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-mint/20 rounded-full mb-4">
            <Leaf className="h-8 w-8 text-mint" />
          </div>
          <h2 className="font-tech text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Our Community Impact
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Together, we're making fashion sustainable, one item at a time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-mint/10 rounded-full mb-4">
              <Leaf className="h-8 w-8 text-mint" />
            </div>
            <div className="text-4xl md:text-5xl font-bold text-mint mb-2">2.5M kg</div>
            <div className="text-lg font-semibold text-foreground mb-2">CO₂ Saved</div>
            <div className="text-sm text-muted-foreground">
              Equivalent to planting 125,000 trees
            </div>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-electric/10 rounded-full mb-4">
              <TrendingUp className="h-8 w-8 text-electric" />
            </div>
            <div className="text-4xl md:text-5xl font-bold text-electric mb-2">50K+</div>
            <div className="text-lg font-semibold text-foreground mb-2">Items Recycled</div>
            <div className="text-sm text-muted-foreground">
              Preventing waste in landfills
            </div>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-mint/10 rounded-full mb-4">
              <Users className="h-8 w-8 text-mint" />
            </div>
            <div className="text-4xl md:text-5xl font-bold text-mint mb-2">10K+</div>
            <div className="text-lg font-semibold text-foreground mb-2">Active Users</div>
            <div className="text-sm text-muted-foreground">
              Growing sustainable community
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
