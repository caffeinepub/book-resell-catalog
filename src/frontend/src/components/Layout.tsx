import { Button } from "@/components/ui/button";
import { Link, Outlet } from "@tanstack/react-router";
import { BookOpen, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export default function Layout() {
  const { login, clear, loginStatus, identity, loginError } =
    useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const { data: isAdmin } = useIsAdmin();

  useEffect(() => {
    if (loginStatus === "loginError") {
      toast.error(
        "Login failed. Please try again or allow popups for this site.",
      );
    }
  }, [loginStatus]);

  useEffect(() => {
    if (loginError) {
      toast.error(loginError.message || "Login failed. Please try again.");
    }
  }, [loginError]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-xs">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 group"
            data-ocid="nav.link"
          >
            <BookOpen className="w-7 h-7 text-primary" />
            <div>
              <span className="font-display text-xl font-700 text-foreground leading-none">
                5aab Books
              </span>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Curated reads at honest prices
              </p>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            {isLoggedIn && isAdmin && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  data-ocid="nav.admin_link"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Manage Books</span>
                </Button>
              </Link>
            )}
            {isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="gap-1"
                data-ocid="nav.logout_button"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="gap-1"
                data-ocid="nav.login_button"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoggingIn ? "Logging in..." : "Admin Login"}</span>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-card border-t border-border py-6 mt-10">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} 5aab Books. Built with{" "}
            <span className="text-red-400">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
