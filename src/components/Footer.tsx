import yoyoLogo from "@/assets/yoyo-logo.png";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-transparent border-t border-border/20 py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Tagline Section */}
        <div className="text-center py-8">
          <p className="text-xl md:text-2xl font-bold mb-2">
            <span className="bg-gradient-to-l from-terracotta via-sage to-terracotta bg-clip-text text-transparent">
              משנים את כללי המשחק
            </span>
          </p>
          <p className="text-base md:text-lg font-semibold">
            <span className="bg-gradient-to-r from-sage via-terracotta to-sage bg-clip-text text-transparent">
              אמינות · חדשנות · אקולוגיה
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
