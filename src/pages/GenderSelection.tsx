import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";

const GenderSelection = () => {
  const navigate = useNavigate();

  const handleGenderSelect = (gender: string) => {
    navigate(`/shop?gender=${gender}`);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              בואו נמצא את הבגד המושלם! ✨
            </h1>
            <p className="text-xl text-muted-foreground">למי אתם מחפשים?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card 
              className="group cursor-pointer hover:shadow-warm transition-all duration-300 overflow-hidden bg-gradient-card border-border/50"
              onClick={() => handleGenderSelect("women")}
            >
              <div className="p-12 text-center">
                <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">👩</div>
                <h2 className="text-3xl font-bold mb-4">נשים</h2>
                <p className="text-muted-foreground mb-6">אוסף מיוחד של בגדים לנשים</p>
                <Button className="w-full shadow-warm">בואו נתחיל!</Button>
              </div>
            </Card>

            <Card 
              className="group cursor-pointer hover:shadow-warm transition-all duration-300 overflow-hidden bg-gradient-card border-border/50"
              onClick={() => handleGenderSelect("men")}
            >
              <div className="p-12 text-center">
                <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">👨</div>
                <h2 className="text-3xl font-bold mb-4">גברים</h2>
                <p className="text-muted-foreground mb-6">אוסף מיוחד של בגדים לגברים</p>
                <Button className="w-full shadow-warm">בואו נתחיל!</Button>
              </div>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button 
              variant="ghost" 
              className="text-muted-foreground"
              onClick={() => navigate("/shop")}
            >
              או הצג הכל ללא סינון
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GenderSelection;
