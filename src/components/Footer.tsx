import yoyoLogo from "@/assets/yoyo-logo.png";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={yoyoLogo} alt="YOYO" className="w-12 h-12" />
              <span className="font-tech text-2xl font-bold text-electric">YOYO</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              AI-powered secondhand fashion marketplace. Smart, verified, and sustainable shopping for the modern world.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-muted hover:bg-electric/20 hover:text-electric transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted hover:bg-electric/20 hover:text-electric transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted hover:bg-electric/20 hover:text-electric transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted hover:bg-electric/20 hover:text-electric transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-electric transition-colors">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-electric transition-colors">How It Works</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-electric transition-colors">Sustainability</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-electric transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-electric transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-electric transition-colors">Seller Guide</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-electric transition-colors">Buyer Protection</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-electric transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2025 YOYO. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-electric transition-colors">Privacy Policy</a>
            <a href="#" className="text-muted-foreground hover:text-electric transition-colors">Terms of Service</a>
            <a href="#" className="text-muted-foreground hover:text-electric transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
