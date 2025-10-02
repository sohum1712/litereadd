import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { LogOut, Sparkles } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 glass">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
            <span className="text-2xl font-bold gradient-text">LITE READ</span>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              to="/"
              className={`transition-smooth ${
                isActive("/") ? "text-primary font-semibold" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              Home
            </Link>
            {user && (
              <Link
                to="/library"
                className={`transition-smooth ${
                  isActive("/library") ? "text-primary font-semibold" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                Library
              </Link>
            )}
            <Link
              to="/contact"
              className={`transition-smooth ${
                isActive("/contact") ? "text-primary font-semibold" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              Contact
            </Link>

            {user ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-primary/50 hover:bg-primary/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                className="bg-gradient-primary glow-primary"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
