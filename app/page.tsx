// ============================================================
// app/page.tsx — Homepage with career search + questionnaire flow
// ============================================================

"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Questionnaire } from "@/components/roadmap/Questionnaire";
import { RoadmapView } from "@/components/roadmap/RoadmapView";
import { CAREERS_DATA, getFeaturedCareers, getTrendingCareers } from "@/data/careers";
import { CATEGORIES } from "@/data/categories";
import { Button, Badge, GlassCard, StatCard, EmptyState, SkeletonCard, Chip } from "@/components/ui";
import {
  useRoadmapGeneration, useSavedRoadmaps, useUserProfile, useDebounce,
} from "@/hooks";
import type { CareerData, UserAnswers } from "@/types";
import { cn } from "@/utils";
import { track, Events } from "@/lib/analytics";

// ── View state machine ────────────────────────────────────────

type View = "home" | "quiz" | "roadmap";

export default function HomePage() {
  const [view,           setView]    = useState<View>("home");
  const [selectedCareer, setCareer]  = useState<CareerData | null>(null);
  const [searchQuery,    setSearch]  = useState("");
  const [activeCategory, setCategory]= useState("all");

  const debouncedSearch = useDebounce(searchQuery, 240);

  const { loading, error, roadmap, generate, reset } = useRoadmapGeneration();
  const generatingRef = React.useRef(false); // prevents double-submit
  const { saveRoadmap, roadmaps }                     = useSavedRoadmaps();
  const { profile, recordActivity, incrementRoadmaps }= useUserProfile();

  // Filtered career list
  const filteredCareers = useMemo(() => {
    let list = CAREERS_DATA;
    if (activeCategory !== "all") list = list.filter((c) => c.categoryId === activeCategory);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, debouncedSearch]);

  // ── Handlers ────────────────────────────────────────────────

  const handleSelectCareer = (career: CareerData) => {
    setCareer(career);
    setView("quiz");
    track(Events.CAREER_SELECTED, { career: career.label });
  };

  const handleQuizSubmit = async (answers: UserAnswers) => {
    if (!selectedCareer) return;
    if (generatingRef.current) return; // prevent double-submit
    generatingRef.current = true;
    track(Events.QUIZ_STARTED, { career: selectedCareer.label });
    setView("roadmap");
    try {
      await generate(selectedCareer.id, selectedCareer.label, answers);
      incrementRoadmaps();
      recordActivity();
    } finally {
      generatingRef.current = false;
    }
  };

  const handleSave = (r: ReturnType<typeof roadmap>) => {
    if (!r) return;
    saveRoadmap(r);
    track(Events.ROADMAP_SAVED, { career: r.careerLabel });
  };

  const handleBack = () => {
    reset();
    if (view === "roadmap") { setView("quiz"); return; }
    setView("home");
    setCareer(null);
  };

  // ── Render ───────────────────────────────────────────────────

  if (view === "quiz" && selectedCareer) {
    return (
      <>
        <Navbar />
        <main className="pt-16">
          <Questionnaire
            careerLabel={selectedCareer.label}
            careerIcon={selectedCareer.icon}
            onSubmit={handleQuizSubmit}
            onBack={() => { setView("home"); setCareer(null); }}
          />
        </main>
        <Footer />
      </>
    );
  }

  if (view === "roadmap") {
    return (
      <>
        <Navbar />
        <main className="pt-16">
          {loading && <RoadmapSkeleton career={selectedCareer} />}
          {error && (
            <div className="max-w-xl mx-auto px-4 py-24 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="font-display font-bold text-xl mb-3">Generation Failed</h2>
              <p className="text-muted-foreground text-sm mb-6">{error}</p>
              <Button variant="primary" onClick={handleBack}>← Try Again</Button>
            </div>
          )}
          {!loading && !error && roadmap && (
            <RoadmapView roadmap={roadmap} onSave={handleSave} onBack={handleBack} />
          )}
        </main>
        <Footer />
      </>
    );
  }

  // HOME view
  return (
    <>
      <Navbar />
      <main className="pt-16 overflow-x-hidden">
        {/* Floating orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div className="orb orb-brand absolute w-[600px] h-[600px] -top-40 -left-32 opacity-60" />
          <div className="orb orb-purple absolute w-[500px] h-[500px] top-1/2 -right-48 opacity-40" style={{ animationDelay: "-3s" }} />
          <div className="orb orb-gold absolute w-[300px] h-[300px] bottom-1/4 left-1/3 opacity-30" style={{ animationDelay: "-6s" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

          {/* ── Hero ──────────────────────────────────────────── */}
          <HeroSection onSearch={setSearch} searchQuery={searchQuery} />

          {/* ── Stats row ─────────────────────────────────────── */}
          <StatsRow />

          {/* ── Career grid ───────────────────────────────────── */}
          <section className="py-8">
            {/* Category pills */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <h2 className="font-display font-bold text-xl">
                {debouncedSearch ? `Results for "${debouncedSearch}"` : "Choose Your Career Path"}
              </h2>
              <div className="flex gap-2 flex-wrap">
                <Chip label="All" selected={activeCategory === "all"} onClick={() => setCategory("all")} />
                {CATEGORIES.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={`${cat.icon} ${cat.label}`}
                    selected={activeCategory === cat.id}
                    onClick={() => setCategory(cat.id)}
                  />
                ))}
              </div>
            </div>

            {filteredCareers.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No careers found"
                description={`No results for "${debouncedSearch}". Try a different keyword.`}
                action={<Button variant="secondary" size="sm" onClick={() => setSearch("")}>Clear search</Button>}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
                {filteredCareers.map((career, i) => (
                  <CareerCard
                    key={career.id}
                    career={career}
                    onClick={() => handleSelectCareer(career)}
                    delay={i * 35}
                  />
                ))}
              </div>
            )}

            {/* Custom career input */}
            <CustomCareerBox onGenerate={(label) => {
              const custom: CareerData = {
                id: "custom", label, slug: "custom", icon: "🎯",
                category: "Custom", categoryId: "custom",
                description: label, tagline: "Custom career path",
                salaryBand: { fresher: "Varies", junior: "Varies", mid: "Varies", senior: "Varies", lead: "Varies" },
                demandScore: 75, growthRate: "Varies", aiRiskLevel: "medium", futureProofScore: 75,
                requiredSkills: [], coreTools: [], certifications: [], internshipPlatforms: [],
                topCompanies: [], relatedCareers: [], cityOpportunities: [], educationPaths: [],
                avgTimeToJob: "Varies", tags: [], trending: false, featured: false,
              };
              handleSelectCareer(custom);
            }} />
          </section>

          {/* ── Saved roadmaps ─────────────────────────────────── */}
          {roadmaps.length > 0 && (
            <section className="py-8 border-t border-border/40">
              <h2 className="font-display font-bold text-xl mb-5">Your Saved Roadmaps</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {roadmaps.slice(0, 6).map((r) => (
                  <SavedRoadmapCard
                    key={r.id}
                    roadmap={r}
                    onClick={() => {
                      // Display saved roadmap directly — no API call needed
                      const career = CAREERS_DATA.find((c) => c.id === r.careerId);
                      if (career) setCareer(career);
                      reset(); // clear any stale roadmap state
                      setView("roadmap");
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Feature highlights ─────────────────────────────── */}
          <FeatureSection />

          {/* ── Trending section ───────────────────────────────── */}
          <TrendingSection onSelect={handleSelectCareer} />

        </div>
      </main>
      <Footer />
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────

function HeroSection({ onSearch, searchQuery }: { onSearch: (q: string) => void; searchQuery: string }) {
  return (
    <section className="text-center pt-16 pb-10 animate-fade-up">
      <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-medium text-brand-300 mb-7">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
        AI-Powered Career Intelligence for India 🇮🇳
      </div>

      <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] mb-5 tracking-tight">
        Your Personalized<br />
        <span className="grad-text-brand">Career Roadmap</span><br />
        <span className="text-gold">Starts Here</span>
      </h1>

      <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-9 leading-relaxed">
        AI generates a complete career path — skills, projects, salary data, and a 90-day action plan. Built for Indian students and professionals.
      </p>

      {/* Search bar */}
      <div className="relative max-w-lg mx-auto">
        <div className="absolute inset-0 rounded-2xl bg-brand-500/10 blur-xl" />
        <div className="relative flex items-center gap-3 bg-[#0d1121]/80 backdrop-blur-xl border border-brand-500/25 rounded-2xl px-5 py-3.5 shadow-premium focus-within:border-brand-500/60 transition-all">
          <span className="text-lg flex-shrink-0">🔍</span>
          <input
            type="text"
            placeholder="Search any career — Full Stack, Data Science, CA, UX..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {searchQuery && (
            <button onClick={() => onSearch("")} className="text-muted-foreground hover:text-foreground transition-colors text-lg">×</button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        No sign-up needed · Free for 3 roadmaps · India-specific data
      </p>
    </section>
  );
}

function StatsRow() {
  const stats = [
    { icon: "🎯", label: "Career Paths", value: "200+", sub: "India-specific" },
    { icon: "👨‍🎓", label: "Students Helped", value: "50K+", sub: "Growing daily" },
    { icon: "💼", label: "Job Roles Mapped", value: "1,200+", sub: "Across sectors" },
    { icon: "🏆", label: "Avg Salary Growth", value: "3.2×", sub: "Within 3 years" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 py-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
      {stats.map((s) => (
        <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} sub={s.sub} variant="brand" />
      ))}
    </div>
  );
}

function CareerCard({ career, onClick, delay }: { career: CareerData; onClick: () => void; delay: number }) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-4 sm:p-5 text-left group animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-2xl sm:text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
        {career.icon}
      </div>
      <div className="font-display font-semibold text-sm leading-tight mb-1.5 text-foreground group-hover:text-brand-300 transition-colors">
        {career.label}
      </div>
      <div className="text-xs text-muted-foreground mb-2">{career.category}</div>
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-[10px] px-2 py-0.5 rounded-full font-medium",
          career.demandScore >= 90
            ? "bg-success/10 text-success"
            : career.demandScore >= 75
            ? "bg-brand-500/10 text-brand-400"
            : "bg-gold/10 text-gold"
        )}>
          {career.demandScore >= 90 ? "🔥 Hot" : career.demandScore >= 75 ? "📈 Growing" : "💡 Niche"}
        </span>
        {career.trending && (
          <span className="text-[10px] text-gold">Trending</span>
        )}
      </div>
    </button>
  );
}

function CustomCareerBox({ onGenerate }: { onGenerate: (label: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="mt-5 glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="text-2xl">✨</div>
      <div className="flex-1">
        <div className="text-sm font-semibold mb-2">Don&apos;t see your career?</div>
        <input
          className="w-full max-w-sm bg-input border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all"
          placeholder="e.g. Ethical Hacker, Sports Analyst, Animator..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) onGenerate(value.trim()); }}
        />
      </div>
      <Button
        variant="primary"
        size="sm"
        disabled={!value.trim()}
        onClick={() => value.trim() && onGenerate(value.trim())}
      >
        Generate →
      </Button>
    </div>
  );
}

function SavedRoadmapCard({ roadmap, onClick }: { roadmap: { careerLabel: string; careerIcon: string; progress: number; generatedAt: string }; onClick: () => void }) {
  return (
    <button onClick={onClick} className="glass-card p-4 text-left w-full hover:border-gold/40 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">{roadmap.careerIcon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-sm truncate">{roadmap.careerLabel}</div>
          <div className="text-xs text-muted-foreground">Saved roadmap</div>
        </div>
        <Badge variant="gold">Saved</Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full transition-all" style={{ width: `${roadmap.progress}%` }} />
        </div>
        <span className="font-mono text-xs text-brand-400">{roadmap.progress}%</span>
      </div>
    </button>
  );
}

function FeatureSection() {
  const features = [
    { icon: "🗺️", title: "Full Roadmap", desc: "Beginner to advanced path with phases, timelines, and checkpoints personalised to your level." },
    { icon: "💸", title: "India Salary Data", desc: "City-wise salary ranges in ₹ for freshers to senior roles — Bangalore, Mumbai, Hyderabad & more." },
    { icon: "🧪", title: "Project Portfolio", desc: "Portfolio-ready projects ranked by difficulty and recruiter impact. Build the right things." },
    { icon: "🎓", title: "Certifications Guide", desc: "Best certs ranked by ROI — free and paid options, time to complete, and provider links." },
    { icon: "📅", title: "7/30/90-Day Plans", desc: "Structured daily, weekly, and monthly action plans you can actually follow." },
    { icon: "🔍", title: "Interview Prep", desc: "Common questions, coding topics, system design prep, and India-specific resources." },
  ];

  return (
    <section className="py-12 border-t border-border/40">
      <h2 className="font-display font-bold text-2xl text-center mb-2">Everything in One Roadmap</h2>
      <p className="text-muted-foreground text-sm text-center mb-8">Built specifically for the Indian career landscape</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <div
            key={i}
            className="glass-card p-5 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="text-2xl mb-3">{f.icon}</div>
            <div className="font-display font-bold text-sm mb-2">{f.title}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrendingSection({ onSelect }: { onSelect: (c: CareerData) => void }) {
  const trending = getTrendingCareers().slice(0, 6);
  return (
    <section className="py-10 border-t border-border/40">
      <div className="flex items-center gap-2 mb-6">
        <span>🔥</span>
        <h2 className="font-display font-bold text-xl">Trending Careers in India</h2>
        <Badge variant="gold" dot>2025</Badge>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {trending.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card hover:border-brand-500/40 transition-all text-sm font-medium"
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
            <span className="font-mono text-[10px] text-success ml-1">{c.growthRate.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function RoadmapSkeleton({ career }: { career: CareerData | null }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="text-3xl">{career?.icon ?? "🎯"}</div>
        <div>
          <div className="shimmer h-7 w-64 rounded-lg mb-2" />
          <div className="shimmer h-4 w-48 rounded" />
        </div>
      </div>
      <div className="shimmer h-12 w-full rounded-xl mb-4" />
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[0,1,2,3].map((i) => <SkeletonCard key={i} />)}
      </div>
      <div className="flex gap-2 mb-6">
        {[0,1,2,3,4].map((i) => <div key={i} className="shimmer h-9 w-24 rounded-lg" />)}
      </div>
      <SkeletonCard className="h-96" />
      <div className="mt-4 text-center text-sm text-muted-foreground animate-pulse">
        🤖 AI is generating your personalised roadmap for <strong>{career?.label}</strong>...
      </div>
    </div>
  );
}
