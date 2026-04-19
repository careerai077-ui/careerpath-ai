// ============================================================
// types/index.ts — Core type definitions for CareerPath AI
// ============================================================

export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type GoalType = "job" | "freelance" | "startup" | "international" | "higher_studies" | "government";
export type AIProvider = "groq" | "gemini" | "anthropic" | "openai" | "template";
export type PlanTier = "free" | "pro" | "team";

// ── Career & Data Types ──────────────────────────────────────

export interface CareerSalaryBand {
  fresher: string;       // e.g. "₹3–5 LPA"
  junior: string;        // 1-3 years
  mid: string;           // 3-6 years
  senior: string;        // 6-10 years
  lead: string;          // 10+ years
  freelance?: string;    // freelance range
}

export interface CityOpportunity {
  city: string;
  salaryMultiplier: number; // 1.0 = base (Bangalore)
  jobCount: string;
  topCompanies: string[];
}

export interface CareerData {
  id: string;
  label: string;
  slug: string;
  icon: string;
  category: string;
  categoryId: string;
  description: string;
  tagline: string;
  salaryBand: CareerSalaryBand;
  demandScore: number;      // 1–100
  growthRate: string;       // e.g. "32% YoY"
  aiRiskLevel: "low" | "medium" | "high";
  futureProofScore: number; // 1–100
  requiredSkills: string[];
  coreTools: string[];
  certifications: Certification[];
  internshipPlatforms: string[];
  topCompanies: string[];
  relatedCareers: string[];
  cityOpportunities: CityOpportunity[];
  educationPaths: EducationPath[];
  avgTimeToJob: string;
  tags: string[];
  trending: boolean;
  featured: boolean;
}

export interface Certification {
  name: string;
  provider: string;
  cost: string;
  duration: string;
  roiScore: number; // 1–10
  free: boolean;
  url?: string;
}

export interface EducationPath {
  from: string;   // e.g. "After 12th"
  path: string;   // What to do
  duration: string;
}

// ── User Profile ─────────────────────────────────────────────

export interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  avatar?: string;
  planTier: PlanTier;
  roadmapsGenerated: number;
  streakDays: number;
  lastActiveDate: string;
  totalXP: number;
  badges: Badge[];
  savedRoadmaps: string[];  // roadmap IDs
  createdAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

// ── Questionnaire ─────────────────────────────────────────────

export interface UserAnswers {
  education: string;
  level: SkillLevel;
  timePerDay: string;
  budget: string;
  targetSalary: string;
  goalType: GoalType;
  city: string;
  strengths: string;
  weakAreas: string;
  motivation?: string;
}

// ── Roadmap ───────────────────────────────────────────────────

export interface RoadmapPhase {
  id: string;
  title: string;
  duration: string;
  skills: string[];
  projects: string[];
  milestones: string[];
  resources: LearningResource[];
  completed?: boolean;
}

export interface LearningResource {
  title: string;
  platform: string;
  url?: string;
  cost: string;
  duration: string;
  type: "course" | "book" | "channel" | "community" | "tool";
  rating?: number;
  free: boolean;
}

export interface ProjectIdea {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  skills: string[];
  timeEstimate: string;
  portfolioImpact: number; // 1–10
  githubIdea?: string;
}

export interface SalaryProjection {
  year: number;
  label: string;
  minSalary: number;  // in LPA
  maxSalary: number;
  role: string;
}

export interface GeneratedRoadmap {
  id: string;
  careerId: string;
  careerLabel: string;
  careerIcon: string;
  userId?: string;
  answers: UserAnswers;
  
  // Core content
  careerOverview: string;
  whyThisCareer: string;
  marketDemand: string;
  aiProofAdvice: string;
  
  // Skills breakdown
  beginnerSkills: string[];
  intermediateSkills: string[];
  advancedSkills: string[];
  futureProofSkills: string[];
  
  // Tools
  coreTools: ToolRecommendation[];
  
  // Roadmap phases
  phases: RoadmapPhase[];
  
  // Projects
  projects: ProjectIdea[];
  
  // Certifications
  certifications: Certification[];
  
  // Salary
  salaryProjections: SalaryProjection[];
  salaryInsights: string;
  
  // Career paths
  jobRoles: string[];
  freelanceOpportunities: string;
  startupIdeas: string[];
  backupCareers: string[];
  
  // Strategy
  internshipStrategy: string;
  interviewPrep: InterviewPrep;
  commonMistakes: string[];
  
  // Action plans
  sevenDayPlan: DailyTask[];
  thirtyDayPlan: WeeklyGoal[];
  ninetyDayPlan: MonthlyGoal[];
  
  // Resources
  learningResources: LearningResource[];
  cityOpportunities: string;
  
  // Intelligence scores
  confidenceScore: number;      // 1–100
  timeToJobEstimate: string;
  resumeReadinessScore: number; // 1–100
  interviewReadinessScore: number;
  
  // Meta
  aiProvider: AIProvider;
  generatedAt: string;
  isPublic: boolean;
  shareSlug?: string;
  progress: number; // 0–100
  milestones: Milestone[];
}

export interface ToolRecommendation {
  name: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  free: boolean;
  description: string;
  priority: number; // 1 = learn first
}

export interface InterviewPrep {
  commonQuestions: string[];
  codingTopics: string[];
  systemDesign: string[];
  behavioural: string[];
  resources: string[];
  timeline: string;
}

export interface DailyTask {
  day: number;
  title: string;
  tasks: string[];
  timeRequired: string;
  goal: string;
}

export interface WeeklyGoal {
  week: number;
  theme: string;
  goals: string[];
  deliverable: string;
}

export interface MonthlyGoal {
  month: number;
  theme: string;
  milestones: string[];
  successMetric: string;
}

export interface Milestone {
  id: string;
  label: string;
  description?: string;
  xpReward: number;
  completed: boolean;
  completedAt?: string;
}

// ── API Types ─────────────────────────────────────────────────

export interface GenerateRoadmapRequest {
  careerId: string;
  careerLabel: string;
  answers: UserAnswers;
  preferredProvider?: AIProvider;
}

export interface GenerateRoadmapResponse {
  success: boolean;
  roadmap?: GeneratedRoadmap;
  error?: string;
  provider: AIProvider;
  cached: boolean;
  generationTime: number;
}

export interface CompareRequest {
  careerA: string;
  careerB: string;
  userContext?: Partial<UserAnswers>;
}

export interface CompareResult {
  careerA: string;
  careerB: string;
  winner: string;
  comparison: CareerComparisonMetric[];
  recommendation: string;
  verdict: string;
}

export interface CareerComparisonMetric {
  metric: string;
  careerA: string | number;
  careerB: string | number;
  winner: "A" | "B" | "tie";
}

// ── Analytics ─────────────────────────────────────────────────

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
  timestamp?: string;
}

export interface SearchAnalytics {
  query: string;
  results: number;
  clicked?: string;
  timestamp: string;
}
