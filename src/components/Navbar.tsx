import { Link } from "react-router-dom";

const Navbar = () => {

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          {/* Logo Only */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-primary-foreground">YY</span>
            </div>
            <span className="text-2xl font-black bg-gradient-primary bg-clip-text text-transparent">
              YOYO
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
