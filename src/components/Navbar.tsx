import { Link, useNavigate } from "@tanstack/react-router";
import { Globe2, Map, LogOut, User, Compass, Zap, Brain, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useTrips";
import { auth } from "@/lib/tripStore";

export function Navbar() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    auth.logout();
    navigate({ to: "/" });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="glass rounded-2xl flex items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Globe2 className="h-7 w-7 text-primary group-hover:rotate-180 transition-transform duration-700" />
              <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Globe<span className="text-gradient">X</span>
              <span className="text-muted-foreground text-sm ml-1">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/cities"><span className="flex items-center gap-1"><Compass className="h-3.5 w-3.5" />Destinations</span></NavLink>
            <NavLink to="/activities"><span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" />Activities</span></NavLink>
            <NavLink to="/ai-planner">
              <span className="flex items-center gap-1">
                <Brain className="h-3.5 w-3.5" />
                AI Planner
              </span>
            </NavLink>

            {isLoggedIn ? (
              <>
                <NavLink to="/dashboard">
                  <span className="flex items-center gap-1.5">
                    <Map className="h-3.5 w-3.5" />
                    My Trips
                  </span>
                </NavLink>
                <NavLink to="/admin">
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </span>
                </NavLink>
                <div className="flex items-center gap-2 ml-1">
                  <Link to="/profile" id="navbar-profile-btn"
                    className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm uppercase hover:scale-110 transition-transform"
                    title="Profile">
                    {user?.name?.[0] ?? <User className="h-4 w-4" />}
                  </Link>
                  <button
                    id="navbar-logout-btn"
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 rounded-xl hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                id="navbar-login-btn"
                className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:scale-105 transition-transform"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
      activeProps={{ className: "px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-white/5" }}
    >
      {children}
    </Link>
  );
}

