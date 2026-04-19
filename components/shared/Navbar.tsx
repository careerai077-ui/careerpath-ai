// ============================================================
// components/shared/Navbar.tsx — Sticky premium navbar
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import { Button, Badge } from "@/components/ui";
import { useUserProfile } from "@/hooks";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/careers", label: "Careers" },
  { href: "/compare", label: "Compare" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, streakAtRisk } = useUserProfile();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-2xl border-b border-border/60 shadow-premium"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white shadow-glow-sm">
              CP
            </div>
            <span className="font-display font-bold text-base hidden sm:block">
              <span className="grad-text-brand">CareerPath</span>
              <span className="text-gold"> AI</span>
            </span>
            <span className="font-mono text-[10px] text-muted-foreground hidden lg:block mt-0.5">India</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-brand-500/12 text-brand-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/4"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2.5">
            {/* Streak indicator */}
            {profile.streakDays > 0 && (
              <div
                className={cn(
                  "hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium",
                  streakAtRisk
                    ? "bg-orange-500/10 border-orange-500/25 text-orange-400"
                    : "bg-gold/10 border-gold/25 text-gold"
                )}
              >
                <span>{streakAtRisk ? "⚠️" : "🔥"}</span>
                <span>{profile.streakDays}d</span>
              </div>
            )}

            {/* XP badge */}
            {profile.totalXP > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-500/8 border border-brand-500/20 text-xs font-mono text-brand-400">
                ✦ {profile.totalXP} XP
              </div>
            )}

            {/* CTA */}
            <Link href="/">
              <Button size="sm" variant="primary" className="hidden sm:inline-flex">
                Generate Roadmap
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-2xl">
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-brand-500/12 text-brand-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/4"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border/40">
              <Link href="/" className="block">
                <Button size="sm" variant="primary" className="w-full">
                  Generate My Roadmap →
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
