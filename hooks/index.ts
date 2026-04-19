// ============================================================
// hooks/index.ts — Custom React hooks (client-side only)
// ============================================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { GeneratedRoadmap, UserAnswers, UserProfile, Milestone } from "@/types";
import { calculateProgress } from "@/lib/roadmap-engine/template-builder";
import { calculateStreak, isStreakAtRisk } from "@/utils";

// ── useLocalStorage ───────────────────────────────────────────

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage quota exceeded — silent fail
    }
  }, [key, value]);

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(initial);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue, remove] as const;
}

// ── useSavedRoadmaps ──────────────────────────────────────────

export function useSavedRoadmaps() {
  const [roadmaps, setRoadmaps, clearAll] = useLocalStorage<GeneratedRoadmap[]>(
    "cp-roadmaps",
    []
  );

  const saveRoadmap = useCallback(
    (roadmap: GeneratedRoadmap) => {
      setRoadmaps((prev) => {
        const idx = prev.findIndex((r) => r.id === roadmap.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = roadmap;
          return updated;
        }
        return [roadmap, ...prev].slice(0, 10);
      });
    },
    [setRoadmaps]
  );

  const deleteRoadmap = useCallback(
    (id: string) => {
      setRoadmaps((prev) => prev.filter((r) => r.id !== id));
    },
    [setRoadmaps]
  );

  const updateMilestone = useCallback(
    (roadmapId: string, milestoneId: string, completed: boolean) => {
      setRoadmaps((prev) =>
        prev.map((r) => {
          if (r.id !== roadmapId) return r;
          const updatedMilestones: Milestone[] = r.milestones.map((m) =>
            m.id === milestoneId
              ? { ...m, completed, completedAt: completed ? new Date().toISOString() : undefined }
              : m
          );
          return { ...r, milestones: updatedMilestones, progress: calculateProgress(updatedMilestones) };
        })
      );
    },
    [setRoadmaps]
  );

  const getRoadmapById = useCallback(
    (id: string) => roadmaps.find((r) => r.id === id) ?? null,
    [roadmaps]
  );

  return { roadmaps, saveRoadmap, deleteRoadmap, updateMilestone, getRoadmapById, clearAll };
}

// ── useRoadmapGeneration ──────────────────────────────────────

export function useRoadmapGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<GeneratedRoadmap | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const abortRef    = useRef<AbortController | null>(null);
  const loadingRef   = useRef<boolean>(false);

  const generate = useCallback(
    async (careerId: string, careerLabel: string, answers: UserAnswers) => {
      // Prevent duplicate in-flight requests (double-click, StrictMode double-invoke)
      if (loadingRef.current) return;
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      loadingRef.current = true;
      setError(null);
      setRoadmap(null);
      setProvider(null);

      try {
        const res = await fetch("/api/generate-roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ careerId, careerLabel, answers }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          let message = `Server error (${res.status})`;
          try { message = JSON.parse(text).error ?? message; } catch {}
          throw new Error(message);
        }

        const data = await res.json() as { success: boolean; roadmap?: GeneratedRoadmap; provider?: string; error?: string };
        if (!data.success) throw new Error(data.error ?? "Generation failed");

        setRoadmap(data.roadmap!);
        setProvider(data.provider ?? null);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    []
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    loadingRef.current = false;
    setLoading(false);
    setError(null);
    setRoadmap(null);
    setProvider(null);
  }, []);

  return { loading, error, roadmap, provider, generate, reset };
}

// ── useUserProfile ────────────────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  planTier: "free",
  roadmapsGenerated: 0,
  streakDays: 0,
  lastActiveDate: new Date().toISOString(),
  totalXP: 0,
  badges: [],
  savedRoadmaps: [],
};

export function useUserProfile() {
  const [profile, setProfile] = useLocalStorage<UserProfile>("cp-profile", DEFAULT_PROFILE);

  const recordActivity = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      streakDays: calculateStreak(prev.lastActiveDate, prev.streakDays),
      lastActiveDate: new Date().toISOString(),
    }));
  }, [setProfile]);

  const addXP = useCallback(
    (xp: number) => setProfile((prev) => ({ ...prev, totalXP: prev.totalXP + xp })),
    [setProfile]
  );

  const incrementRoadmaps = useCallback(
    () => setProfile((prev) => ({ ...prev, roadmapsGenerated: prev.roadmapsGenerated + 1 })),
    [setProfile]
  );

  const streakAtRisk = isStreakAtRisk(profile.lastActiveDate);
  const canGenerateFree = profile.planTier === "free" && profile.roadmapsGenerated < 3;

  return { profile, setProfile, recordActivity, addXP, incrementRoadmaps, streakAtRisk, canGenerateFree };
}

// ── useCompareCareer ──────────────────────────────────────────

export interface CompareResultItem {
  metric: string;
  careerA: string;
  careerB: string;
  winner: "A" | "B" | "tie";
}

export interface CompareResult {
  careerA: string;
  careerB: string;
  winner: string;
  comparison: CompareResultItem[];
  recommendation: string;
  verdict: string;
}

export function useCompareCareer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compare = useCallback(async (careerA: string, careerB: string) => {
    if (!careerA.trim() || !careerB.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/compare-careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerA: careerA.trim(), careerB: careerB.trim() }),
      });
      const data = await res.json() as { success: boolean; result?: CompareResult; error?: string };
      if (!data.success) throw new Error(data.error ?? "Comparison failed");
      setResult(data.result!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setResult(null); setError(null); }, []);

  return { loading, result, error, compare, reset };
}

// ── useScrollAnimation ────────────────────────────────────────

export function useScrollAnimation(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ── useDebounce ───────────────────────────────────────────────

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── useMediaQuery ─────────────────────────────────────────────

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

// ── useKeyPress ───────────────────────────────────────────────

export function useKeyPress(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === key) callback(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback]);
}
