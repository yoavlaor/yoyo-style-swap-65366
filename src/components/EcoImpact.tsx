import { Leaf, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

export const EcoImpact = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden" dir="rtl">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-sage rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-terracotta rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-sage/15 to-terracotta/15 rounded-full mb-4">
            <Leaf className="h-10 w-10 text-sage" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            ההשפעה של הקהילה שלנו
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ביחד, אנחנו הופכים את האופנה לבת-קיימה, פריט אחר פריט
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-10 bg-card backdrop-blur-sm border-border text-center rounded-3xl shadow-soft hover:shadow-warm transition-shadow">
            <div className="inline-flex items-center justify-center p-4 bg-sage/10 rounded-2xl mb-6">
              <Leaf className="h-10 w-10 text-sage" />
            </div>
            <div className="text-4xl md:text-5xl font-bold text-sage mb-2">2.5 מיליון ק״ג</div>
            <div className="text-lg font-semibold text-foreground mb-2">CO₂ נחסך</div>
            <div className="text-sm text-muted-foreground">
              שווה ערך לנטיעת 125,000 עצים
            </div>
          </Card>

          <Card className="p-10 bg-card backdrop-blur-sm border-border text-center rounded-3xl shadow-soft hover:shadow-warm transition-shadow">
            <div className="inline-flex items-center justify-center p-4 bg-terracotta/10 rounded-2xl mb-6">
              <TrendingUp className="h-10 w-10 text-terracotta" />
            </div>
            <div className="text-4xl md:text-5xl font-bold text-terracotta mb-2">50,000+</div>
            <div className="text-lg font-semibold text-foreground mb-2">פריטים ממוחזרים</div>
            <div className="text-sm text-muted-foreground">
              מונעים פסולת במזבלות
            </div>
          </Card>

          <Card className="p-10 bg-card backdrop-blur-sm border-border text-center rounded-3xl shadow-soft hover:shadow-warm transition-shadow">
            <div className="inline-flex items-center justify-center p-4 bg-sage/10 rounded-2xl mb-6">
              <Users className="h-10 w-10 text-sage" />
            </div>
            <div className="text-4xl md:text-5xl font-bold text-sage mb-2">10,000+</div>
            <div className="text-lg font-semibold text-foreground mb-2">משתמשים פעילים</div>
            <div className="text-sm text-muted-foreground">
              קהילה בת-קיימא צומחת
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
