import yoyoLogo from "@/assets/yoyo-logo.png";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={yoyoLogo} alt="YOYO" className="w-12 h-12" />
              <span className="text-2xl font-bold text-terracotta">YOYO</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
              פלטפורמת האופנה המשומשת המתקדמת בישראל. קניות חכמות, מאומתות וירוקות לעולם המודרני 🌱
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-3 rounded-full bg-muted hover:bg-terracotta/10 hover:text-terracotta transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 rounded-full bg-muted hover:bg-terracotta/10 hover:text-terracotta transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 rounded-full bg-muted hover:bg-terracotta/10 hover:text-terracotta transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 rounded-full bg-muted hover:bg-terracotta/10 hover:text-terracotta transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">קישורים מהירים 🔗</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-terracotta transition-colors">אודותינו 📖</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-terracotta transition-colors">איך זה עובד? 🤔</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-terracotta transition-colors">קיימות 🌍</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-terracotta transition-colors">הבלוג שלנו ✍️</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">תמיכה 💬</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-terracotta transition-colors">מרכז עזרה 🆘</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-terracotta transition-colors">מדריך למוכרים 📚</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-terracotta transition-colors">הגנת קונים 🛡️</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-terracotta transition-colors">צרו קשר 📧</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2025 YOYO. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-terracotta transition-colors">מדיניות פרטיות 🔒</a>
            <a href="#" className="text-muted-foreground hover:text-terracotta transition-colors">תנאי שימוש 📜</a>
            <a href="#" className="text-muted-foreground hover:text-terracotta transition-colors">מדיניות עוגיות 🍪</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
