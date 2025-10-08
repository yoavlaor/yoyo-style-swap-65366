import { Shield, Sparkles, Leaf, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "מוכרים מאומתים",
    description: "כל מוכר מאומת על ידי מערכת הבינה המלאכותית שלנו כדי להבטיח אותנטיות ואמינות.",
    color: "electric"
  },
  {
    icon: Sparkles,
    title: "מופעל בבינה מלאכותית",
    description: "המלצות חכמות המבוססות על הסגנון, המידה וההעדפות שלכם.",
    color: "mint"
  },
  {
    icon: Leaf,
    title: "נקודות אקולוגיות",
    description: "צברו תגמולים על כל קנייה בת-קיימה ועקבו אחר ההשפעה הסביבתית שלכם.",
    color: "mint"
  },
  {
    icon: Zap,
    title: "התאמה מיידית",
    description: "מצאו התאמות מושלמות עם טכנולוגיית הדמות הווירטואלית שלנו.",
    color: "electric"
  }
];

export const Features = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/30" dir="rtl">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            למה לבחור ב-YOYO?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            חוו את השמחה של אופנה בת-קיימה עם תכונות חכמות וידידותיות
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
