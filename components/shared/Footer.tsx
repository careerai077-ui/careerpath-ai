// ============================================================
// components/shared/Footer.tsx
// ============================================================

import React from "react";
import Link from "next/link";

const FOOTER_LINKS = {
  "Careers": [
    { label: "Full-Stack Developer", href: "/careers/full-stack-developer" },
    { label: "AI/ML Engineer", href: "/careers/ai-ml-engineer" },
    { label: "Data Scientist", href: "/careers/data-scientist" },
    { label: "UI/UX Designer", href: "/careers/ui-ux-designer" },
    { label: "Product Manager", href: "/careers/product-manager" },
  ],
  "Resources": [
    { label: "Career Quiz", href: "/#quiz" },
    { label: "Compare Careers", href: "/compare" },
    { label: "Salary Guide India", href: "/salaries" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pricing", href: "/pricing" },
  ],
  "Popular Guides": [
    { label: "Careers After 12th", href: "/guides/careers-after-12th" },
    { label: "Careers After B.Tech", href: "/guides/careers-after-btech" },
    { label: "High Salary Careers India", href: "/guides/high-salary-careers" },
    { label: "Future-Proof Careers 2030", href: "/guides/future-proof-careers" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/60 backdrop-blur-xl mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
                CP
              </div>
              <span className="font-display font-bold text-base">
                <span className="grad-text-brand">CareerPath</span>
                <span className="text-gold"> AI</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              AI-powered career roadmaps for Indian students and professionals. Free, personalized, and actionable.
            </p>
            <div className="flex items-center gap-2">
              <span className="badge-green inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                Free to use
              </span>
              <span className="text-xs text-muted-foreground">No sign-up required</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-display font-semibold text-sm text-foreground mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CareerPath AI India. Made with ❤️ for Indian students.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Terms</Link>
            <a href="mailto:hello@careerpathai.in" className="text-xs text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
