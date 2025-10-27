import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Upload, User, Menu, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: "בית", path: "/", icon: Home },
    { name: "העלאה", path: "/upload", icon: Upload },
    { name: "צ'אטים", path: "/menu", icon: MessageCircle },
    { name: "פרופיל", path: "/profile", icon: User },
    { name: "תפריט", path: "/feed", icon: Menu },
  ];

  const handleNavClick = (path: string) => {
    if (!user && path !== "/" && path !== "/feed") {
      navigate("/auth");
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t-2 border-primary/20 shadow-glow" dir="rtl">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex justify-around items-center h-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
                  active
                    ? "bg-gradient-to-br from-primary to-accent text-white scale-110 shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className={`w-6 h-6 ${active ? "animate-pulse" : ""}`} />
                <span className={`text-xs font-semibold ${active ? "text-white" : ""}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
