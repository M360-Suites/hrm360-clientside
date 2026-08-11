import { Outlet, Link } from "react-router-dom";
import { useEffect } from "react";
import { setCookie } from "../utils/cookies";
import {
  Users,
  BarChart3,
  ShieldCheck,
  BookOpen,
  Zap,
  Globe,
  ArrowRight,
  Star,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Docs", href: "#" },
];

const STATS = [
  { value: "12k+", label: "Organizations" },
  { value: "98%", label: "Uptime SLA" },
  { value: "4.9★", label: "App Rating" },
];

const FEATURES = [
  { icon: Users, text: "Employee lifecycle management" },
  { icon: BarChart3, text: "Real-time attendance & payroll" },
  { icon: ShieldCheck, text: "Role-based access control" },
  { icon: Zap, text: "Automated workflows & alerts" },
];

const AuthLayout = () => {
  useEffect(() => {
    setCookie("hasVisitedLandingPage", "true");
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-slate-950">

      {/* ── TOP NAVIGATION — sits above the image, solid bg ── */}
      <header className="relative z-30 flex h-16 w-full items-center justify-between px-6 lg:px-14 border-b border-white/10 bg-[#0d0d14] shrink-0">
        {/* Logo */}
        <span className="text-xl font-bold text-white tracking-wide">
          HRM<span className="text-[#E91EFA]">360</span>
        </span>

        {/* Nav Links — desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-white/60 hover:text-white transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-flex text-sm text-white/70 hover:text-white font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-xl transition-colors"
          >
            Get started <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ── MAIN AREA — image only lives here ── */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Background image scoped to main area */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hrlady.jpeg"
            alt="Employee background"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
        </div>

        {/* LEFT — marketing copy (desktop only) */}
        <div className="hidden lg:flex flex-col justify-center px-14 xl:px-20 py-12 w-[55%] shrink-0 relative z-10">

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-xs text-white/70 w-fit mb-8">
            <Star size={12} className="text-[#E91EFA] fill-[#E91EFA]" />
            Trusted by 12,000+ companies worldwide
          </div>

          {/* Headline */}
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight mb-5">
            HR operations,<br />
            <span className="text-[#E91EFA]">simplified.</span>
          </h1>
          <p className="text-base text-white/55 max-w-md leading-relaxed mb-10">
            HRM360 brings attendance, payroll, recruitment, and performance into one streamlined platform built for modern teams.
          </p>

          {/* Features list */}
          <ul className="space-y-3 mb-12">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/70">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4A1D96]/60 border border-[#8B5CF6]/30 shrink-0">
                  <Icon size={14} className="text-[#8B5CF6]" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          {/* Stats row */}
          <div className="flex items-center gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bottom links */}
          <div className="flex items-center gap-5 mt-12 pt-8 border-t border-white/10 text-xs text-white/35">
            <a href="#" className="hover:text-white/60 transition-colors flex items-center gap-1.5">
              <BookOpen size={12} /> Documentation
            </a>
            <a href="#" className="hover:text-white/60 transition-colors flex items-center gap-1.5">
              <Globe size={12} /> Blog
            </a>
            <span>·</span>
            <span>© 2025 HRM360</span>
          </div>
        </div>

        {/* RIGHT — form slot */}
        <div className="relative z-10 flex flex-1 items-center justify-center lg:justify-end px-4 sm:px-8 lg:pr-16 xl:pr-24 py-8">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );

};

export default AuthLayout;
