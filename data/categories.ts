// ============================================================
// data/categories.ts
// ============================================================

export interface Category {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;       // Tailwind gradient classes
  careers: string[];   // career IDs
  jobCount: string;
  avgSalary: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "tech",
    label: "Technology",
    icon: "💻",
    description: "Software, AI, cloud, and engineering roles",
    color: "from-brand-500 to-blue-600",
    careers: ["fullstack", "aiml", "datascience", "devops", "cybersecurity", "mobiledev", "blockchain", "gamedev"],
    jobCount: "1.2M+",
    avgSalary: "₹12–45 LPA",
  },
  {
    id: "design",
    label: "Design",
    icon: "🎨",
    description: "UI/UX, graphic design, and product design",
    color: "from-pink-500 to-purple-600",
    careers: ["uiux", "graphicdesigner"],
    jobCount: "180K+",
    avgSalary: "₹6–25 LPA",
  },
  {
    id: "business",
    label: "Business",
    icon: "📋",
    description: "Product, marketing, consulting, and operations",
    color: "from-amber-500 to-orange-600",
    careers: ["productmanager", "digitalmarketing", "entrepreneur"],
    jobCount: "500K+",
    avgSalary: "₹8–40 LPA",
  },
  {
    id: "finance",
    label: "Finance",
    icon: "💹",
    description: "Banking, investment, CA, CFA, and fintech",
    color: "from-emerald-500 to-teal-600",
    careers: ["finance"],
    jobCount: "300K+",
    avgSalary: "₹8–50 LPA",
  },
  {
    id: "creator",
    label: "Creator",
    icon: "🎬",
    description: "Content creation, gaming, and media",
    color: "from-red-500 to-rose-600",
    careers: ["contentcreator", "gamedev"],
    jobCount: "50M+ (global)",
    avgSalary: "₹2–80 LPA",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    icon: "🏥",
    description: "Medical, biotech, and health tech careers",
    color: "from-cyan-500 to-blue-600",
    careers: [],
    jobCount: "200K+",
    avgSalary: "₹5–35 LPA",
  },
  {
    id: "government",
    label: "Government",
    icon: "🏛️",
    description: "UPSC, SSC, banking, defence, and PSU jobs",
    color: "from-slate-500 to-slate-700",
    careers: [],
    jobCount: "Lakhs of openings",
    avgSalary: "₹4–20 LPA + benefits",
  },
  {
    id: "international",
    label: "International",
    icon: "🌍",
    description: "Remote work, abroad jobs, and immigration paths",
    color: "from-violet-500 to-purple-700",
    careers: ["aiml", "devops", "fullstack"],
    jobCount: "Unlimited (remote)",
    avgSalary: "$40K–$200K/year",
  },
];

export const getCategoryById = (id: string) => CATEGORIES.find((c) => c.id === id);
export const ALL_CATEGORY = { id: "all", label: "All Careers", icon: "⚡", description: "", color: "from-brand-500 to-violet-600", careers: [], jobCount: "", avgSalary: "" };
