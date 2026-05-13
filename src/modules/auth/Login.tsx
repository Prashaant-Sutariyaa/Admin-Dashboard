import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";

import FullLogo from "src/assets/images/logos/FullLogo";
import { Button } from "src/components/ui/button";
import { Checkbox } from "src/components/ui/checkbox";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { usePermissionContext } from 'src/permissions/PermissionContext';
import { Icon } from "@iconify/react";

import { authService } from "./services/authService";

const REMEMBER_KEY = "remembered_email";

const features = [
  {
    icon: "solar:chart-2-linear",
    title: "Real-time analytics",
    desc: "Track campaign delivery and performance live",
  },
  {
    icon: "solar:shield-keyhole-linear",
    title: "Role-based access",
    desc: "Fine-grained permissions per module and action",
  },
  {
    icon: "solar:bolt-linear",
    title: "Fast & reliable",
    desc: "Built for teams that move quickly",
  },
];

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
];

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loadPermissions } = usePermissionContext();

  const [loading, setLoading] = useState(false);
  const [remembered, setRemembered] = useState(false);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRemembered(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const emailVal = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (remembered) {
      localStorage.setItem(REMEMBER_KEY, emailVal);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    try {
      setLoading(true);

      const data = await authService.login({ username: emailVal, password });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("name", data.user.first_name);
      sessionStorage.setItem("isAuth", "true");

      const access = await authService.getUserAccess();
      loadPermissions(access.permissions);

      toast.success(`Welcome back, ${data.user.first_name}!`);
      navigate(from, { replace: true });

    } catch (err) {
      // handled globally
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT SIDE ─────────────────────────────────── */}
      <div
        className="hidden md:flex w-3/5 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #111827 0%, #1a2e50 55%, #0f2035 100%)",
        }}
      >
        {/* Decorative rings */}
        {[
          { w: 500, h: 500, t: -140, l: -160, op: 0.1 },
          { w: 320, h: 320, t: 30,   l: -40,  op: 0.07 },
          { w: 560, h: 560, b: -220, r: -160, op: 0.06 },
        ].map((r, i) => (
          <div
            key={i}
            className="absolute pointer-events-none rounded-full"
            style={{
              width: r.w, height: r.h,
              top: r.t, left: r.l, bottom: r.b, right: r.r,
              border: `1px solid rgba(93,135,255,${r.op})`,
            }}
          />
        ))}

        {/* Glow blobs */}
        <div className="absolute pointer-events-none" style={{ width: 180, height: 180, borderRadius: "50%", background: "rgba(93,135,255,0.07)", bottom: 100, left: 60 }} />
        <div className="absolute pointer-events-none" style={{ width: 90, height: 90, borderRadius: "50%", background: "rgba(73,190,255,0.09)", top: 120, right: 80 }} />
        <div className="absolute pointer-events-none" style={{ width: 130, height: 130, borderRadius: 20, border: "1px solid rgba(93,135,255,0.09)", top: 200, left: 80, transform: "rotate(18deg)" }} />

        {/* Content */}
        <div className="relative z-10 max-w-lg w-full">

          {/* Brand mark */}
          <div className="mb-10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(93,135,255,0.15)", border: "1px solid rgba(93,135,255,0.2)" }}>
              <Icon icon="solar:buildings-2-linear" width={18} style={{ color: "#5d87ff" }} />
            </div>
            <span className="text-sm font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>
              ProspectVine CRM
            </span>
          </div>

          <h2 className="text-4xl font-bold mb-3 leading-tight" style={{ color: "rgba(255,255,255,0.93)", letterSpacing: "-0.02em" }}>
            Manage your business<br />
            <span style={{ color: "#5d87ff" }}>smarter.</span>
          </h2>
          <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.75 }}>
            One platform for clients, campaigns, leads, and your entire team workflow.
          </p>

          {/* Feature cards */}
          <div className="flex flex-col gap-3 mb-10">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-4"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: "14px 18px",
                }}
              >
                <div
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(93,135,255,0.12)", border: "1px solid rgba(93,135,255,0.15)" }}
                >
                  <Icon icon={f.icon} width={17} style={{ color: "#5d87ff" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{f.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderLeft: "3px solid rgba(93,135,255,0.5)",
              borderRadius: "0 12px 12px 0",
              padding: "18px 22px",
            }}
          >
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, fontStyle: "italic", marginBottom: 8 }}>
              "{randomQuote.text}"
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>
              — {randomQuote.author}
            </p>
          </div>

        </div>
      </div>

      {/* ── RIGHT SIDE ────────────────────────────────── */}
      <div className="w-full md:w-2/5 flex items-center justify-center px-8 bg-background relative overflow-hidden">

        {/* Subtle bg shapes */}
        <div className="absolute pointer-events-none" style={{ width: 320, height: 320, borderRadius: "50%", background: "color-mix(in oklab, var(--primary) 5%, transparent)", top: -100, right: -100 }} />
        <div className="absolute pointer-events-none" style={{ width: 220, height: 220, borderRadius: "50%", background: "color-mix(in oklab, var(--secondary) 4%, transparent)", bottom: -70, left: -70 }} />

        <div className="w-full max-w-sm relative z-10">

          {/* Logo */}
          <div className="mb-8">
            <FullLogo />
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-foreground mb-1.5">
              Welcome back 👋
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 block">Email</Label>
              <div className="relative">
                <Icon
                  icon="solar:letter-linear"
                  width={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@prospectvine.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="mb-2 block">Password</Label>
              <div className="relative">
                <Icon
                  icon="solar:lock-keyhole-linear"
                  width={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon
                    icon={showPassword ? 'solar:eye-linear' : 'solar:eye-closed-linear'}
                    width={16}
                  />
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remembered}
                onCheckedChange={(v) => setRemembered(!!v)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Remember me
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primaryemphasis text-white font-medium py-2.5 mt-1"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon icon="solar:spinner-linear" width={16} className="animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <Icon icon="solar:arrow-right-linear" width={16} />
                </span>
              )}
            </Button>

          </form>

          {/* Footer note */}
          <p className="text-xs text-muted-foreground text-center mt-8">
            © {new Date().getFullYear()} ProspectVine Pvt. Ltd. All rights reserved.
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;