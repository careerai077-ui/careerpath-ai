// ============================================================
// components/ui/index.tsx — Shared primitive UI components
// ============================================================

"use client";

import React from "react";
import { cn } from "@/utils";

// ── Spinner ───────────────────────────────────────────────────

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <div
      className={cn("inline-block rounded-full border-2 border-brand-500/20 border-t-brand-400", className)}
      style={{
        width: size,
        height: size,
        animation: "spin 0.75s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

// ── Button ────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-sans font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-gradient-to-r from-brand-500 to-violet-500 text-white hover:from-brand-400 hover:to-violet-400 hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0",
    secondary:
      "bg-transparent text-foreground border border-border hover:border-brand-500/40 hover:bg-brand-500/8",
    ghost:
      "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/4",
    danger:
      "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
    gold:
      "bg-gradient-to-r from-gold to-yellow-400 text-black hover:from-yellow-300 hover:to-gold hover:-translate-y-0.5",
  };

  const sizes = {
    sm: "text-xs px-3 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-7 py-3.5",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size={size === "lg" ? 18 : 15} /> : icon}
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────

interface BadgeProps {
  variant?: "brand" | "gold" | "green" | "red" | "muted";
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = "brand", children, className, dot }: BadgeProps) {
  const variants = {
    brand: "badge-brand",
    gold: "badge-gold",
    green: "badge-green",
    red: "badge-red",
    muted: "bg-white/5 text-muted-foreground border border-white/8",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "green" ? "bg-success" : variant === "gold" ? "bg-gold" : "bg-brand-400"
          )}
        />
      )}
      {children}
    </span>
  );
}

// ── GlassCard ─────────────────────────────────────────────────

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
  as?: "div" | "button" | "article";
}

export function GlassCard({
  children,
  className,
  hover = false,
  glow = false,
  onClick,
  as: Tag = "div",
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        "glass-card",
        hover && "cursor-pointer",
        glow && "animate-pulse-glow",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}

// ── ProgressBar ───────────────────────────────────────────────

interface ProgressBarProps {
  value: number; // 0–100
  size?: "sm" | "md" | "lg";
  variant?: "brand" | "gold" | "green";
  label?: string;
  showValue?: boolean;
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  size = "md",
  variant = "brand",
  label,
  showValue = false,
  className,
  animated = true,
}: ProgressBarProps) {
  const safe = Math.max(0, Math.min(100, value));

  const heights = { sm: "h-1", md: "h-1.5", lg: "h-2.5" };
  const fills = {
    brand: "progress-fill",
    gold: "progress-fill progress-fill-gold",
    green: "progress-fill progress-fill-green",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="font-mono text-xs text-brand-400">{safe}%</span>
          )}
        </div>
      )}
      <div className={cn("progress-bar", heights[size])}>
        <div
          className={cn(fills[variant], animated && "transition-all duration-700")}
          style={{ width: `${safe}%`, height: "100%" }}
        />
      </div>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  variant?: "brand" | "gold" | "green";
  className?: string;
}

export function StatCard({ icon, label, value, sub, variant = "brand", className }: StatCardProps) {
  const valueColors = {
    brand: "text-brand-400",
    gold: "text-gold",
    green: "text-success",
  };

  return (
    <div className={cn("glass-card p-5 flex flex-col gap-1", className)}>
      <span className="text-2xl mb-1">{icon}</span>
      <span className={cn("font-display font-bold text-xl", valueColors[variant])}>{value}</span>
      <span className="text-sm text-foreground font-medium">{label}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

// ── SectionDivider ────────────────────────────────────────────

interface DividerProps {
  label?: string;
  className?: string;
}

export function SectionDivider({ label, className }: DividerProps) {
  if (!label) return <hr className={cn("border-border/50 my-6", className)} />;

  return (
    <div className={cn("flex items-center gap-3 my-7", className)}>
      <div className="flex-1 h-px bg-border/60" />
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon = "📭", title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-16 px-6", className)}>
      <div className="text-5xl mb-4 animate-float inline-block">{icon}</div>
      <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}

// ── SkeletonCard ──────────────────────────────────────────────

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card p-5 space-y-3", className)}>
      <div className="shimmer h-4 w-3/4 rounded" />
      <div className="shimmer h-3 w-full rounded" />
      <div className="shimmer h-3 w-2/3 rounded" />
      <div className="shimmer h-8 w-1/2 rounded-lg mt-4" />
    </div>
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="shimmer h-3 rounded"
          style={{ width: `${i === lines - 1 ? 60 : 100}%` }}
        />
      ))}
    </div>
  );
}

// ── Tooltip (simple) ──────────────────────────────────────────

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#0D1421] border border-border rounded-lg text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-premium">
        {content}
      </div>
    </div>
  );
}

// ── Chip (selectable) ─────────────────────────────────────────

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ label, selected, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border",
        selected
          ? "bg-brand-500/15 text-brand-300 border-brand-500/40"
          : "bg-white/3 text-muted-foreground border-border hover:border-brand-500/25 hover:text-foreground",
        className
      )}
    >
      {label}
    </button>
  );
}
