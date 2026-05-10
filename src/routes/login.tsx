import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Globe2, Mail, Lock, Eye, EyeOff, Sparkles, User, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { auth as localAuth } from "@/lib/tripStore";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — GlobeX AI" },
      { name: "description", content: "Sign in to manage your personal travel plans with GlobeX AI." },
    ],
  }),
  component: LoginPage,
});

type Mode = "login" | "signup" | "forgot";

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) throw new Error("Name is required");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: name.trim() },
          },
        });
        if (error) throw error;
        localAuth.signup(email, password);
        toast.success("Check your email to confirm your account");
        navigate({ to: "/dashboard" });
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        localAuth.login(email, password);
        toast.success("Welcome back");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        setForgotSent(true);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const labels = {
    login: { title: "Welcome back", subtitle: "Sign in to continue your journey", cta: "Sign In" },
    signup: { title: "Join GlobeX AI", subtitle: "Create your account and start exploring", cta: "Create Account" },
    forgot: { title: "Reset Password", subtitle: "We'll send a reset link to your email", cta: "Send Reset Link" },
  };
  const { title, subtitle, cta } = labels[mode];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-hero overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="relative">
              <Globe2 className="h-9 w-9 text-primary" />
              <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">
              Globe<span className="text-gradient">X</span>
              <span className="text-muted-foreground text-base ml-1">AI</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            AI-powered travel planning
          </p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-[var(--shadow-glass)]">
          <h1 className="font-display text-2xl font-bold mb-1">{title}</h1>
          <p className="text-muted-foreground text-sm mb-7">{subtitle}</p>

          {forgotSent ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <p className="font-semibold mb-2">Check your email</p>
              <p className="text-sm text-muted-foreground mb-6">
                We sent a password reset link to <span className="text-foreground">{email}</span>
              </p>
              <button onClick={() => { setMode("login"); setForgotSent(false); }} className="text-sm text-primary hover:underline">
                Back to login
              </button>
            </motion.div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm font-medium hover:bg-background/60 transition mb-5"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <Field id="name" label="Full Name" type="text" value={name} onChange={setName}
                    placeholder="Jane Doe" icon={<User className="h-4 w-4" />} />
                )}
                <Field id="email" label="Email" type="email" value={email} onChange={setEmail}
                  placeholder="jane@example.com" icon={<Mail className="h-4 w-4" />} />

                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-sm font-medium block">Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Lock className="h-4 w-4" /></span>
                      <input
                        id="password"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full rounded-xl border border-border bg-background/40 pl-10 pr-10 py-2.5 text-sm focus:border-primary/60 focus:outline-none"
                      />
                      <button type="button" onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <button type="button" onClick={() => setMode("forgot")}
                    className="text-xs text-primary hover:underline block ml-auto">
                    Forgot password?
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet text-primary-foreground font-medium px-4 py-2.5 text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : cta}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {mode === "login" ? (
                  <>Don't have an account?{" "}
                    <button onClick={() => setMode("signup")} className="text-primary hover:underline">Sign up</button>
                  </>
                ) : mode === "signup" ? (
                  <>Already have an account?{" "}
                    <button onClick={() => setMode("login")} className="text-primary hover:underline">Sign in</button>
                  </>
                ) : (
                  <button onClick={() => setMode("login")} className="text-primary hover:underline">Back to login</button>
                )}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Field({ id, label, type, value, onChange, placeholder, icon }: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium block">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className={`w-full rounded-xl border border-border bg-background/40 ${icon ? "pl-10" : "pl-3"} pr-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none`}
        />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8L6 32.6C9.3 39.4 16 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C40 35.7 44 30.3 44 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
