// ============================================================
// data/templates.ts — Prebuilt roadmap templates for top careers
// These serve as fallback if AI API is unavailable,
// AND as enhancement context for AI generation.
// ============================================================

import type { RoadmapPhase, ProjectIdea, SalaryProjection, DailyTask, WeeklyGoal, MonthlyGoal } from "@/types";

export interface RoadmapTemplate {
  careerId: string;
  phases: RoadmapPhase[];
  projects: ProjectIdea[];
  salaryProjections: SalaryProjection[];
  sevenDayPlan: DailyTask[];
  thirtyDayPlan: WeeklyGoal[];
  ninetyDayPlan: MonthlyGoal[];
  beginnerSkills: string[];
  intermediateSkills: string[];
  advancedSkills: string[];
  futureProofSkills: string[];
  commonMistakes: string[];
  backupCareers: string[];
  startupIdeas: string[];
}

// ── Full Stack Developer Template ────────────────────────────

const fullstackTemplate: RoadmapTemplate = {
  careerId: "fullstack",
  beginnerSkills: ["HTML5 & CSS3", "JavaScript fundamentals", "Git basics", "Responsive design", "Basic React"],
  intermediateSkills: ["TypeScript", "React hooks & patterns", "Node.js & Express", "REST API design", "SQL & PostgreSQL", "Authentication (JWT)", "Deployment (Vercel/Netlify)"],
  advancedSkills: ["System design", "Microservices", "Docker & Kubernetes", "Performance optimization", "Security best practices", "GraphQL", "Redis caching"],
  futureProofSkills: ["AI/LLM API integration", "Edge computing", "Web3 basics", "WASM", "AI-assisted development (GitHub Copilot)"],
  phases: [
    {
      id: "phase-1",
      title: "Web Foundations",
      duration: "6–8 weeks",
      skills: ["HTML5", "CSS3", "Flexbox/Grid", "Responsive design", "JavaScript basics (ES6+)", "Git & GitHub"],
      projects: ["Personal portfolio website", "CSS animation showcase"],
      milestones: ["Can build a responsive webpage", "Comfortable with Git push/pull"],
      resources: [
        { title: "The Odin Project", platform: "theodinproject.com", cost: "Free", duration: "3 months", type: "course", free: true },
        { title: "JavaScript.info", platform: "javascript.info", cost: "Free", duration: "Self-paced", type: "course", free: true },
        { title: "CSS Tricks", platform: "css-tricks.com", cost: "Free", duration: "Reference", type: "tool", free: true },
      ],
    },
    {
      id: "phase-2",
      title: "Frontend Mastery",
      duration: "8–10 weeks",
      skills: ["React.js", "Component architecture", "State management", "React Router", "API calls (fetch/axios)", "TypeScript basics"],
      projects: ["Todo app with React", "Weather app with API", "E-commerce product listing"],
      milestones: ["Built 3 React projects", "Comfortable with useState and useEffect"],
      resources: [
        { title: "React Official Docs", platform: "react.dev", cost: "Free", duration: "Self-paced", type: "course", free: true },
        { title: "Full Stack Open (Helsinki)", platform: "fullstackopen.com", cost: "Free", duration: "4 months", type: "course", free: true, rating: 9.5 },
        { title: "Scrimba React Course", platform: "scrimba.com", cost: "Free", duration: "6 weeks", type: "course", free: true },
      ],
    },
    {
      id: "phase-3",
      title: "Backend & Databases",
      duration: "8–10 weeks",
      skills: ["Node.js", "Express.js", "REST API design", "PostgreSQL", "MongoDB", "Authentication", "File uploads", "Error handling"],
      projects: ["Blog API with CRUD", "User authentication system", "File upload service"],
      milestones: ["Can build and deploy a complete REST API", "Understands database design"],
      resources: [
        { title: "Node.js Official Docs", platform: "nodejs.org", cost: "Free", duration: "Self-paced", type: "course", free: true },
        { title: "PostgreSQL Tutorial", platform: "postgresqltutorial.com", cost: "Free", duration: "3 weeks", type: "course", free: true },
        { title: "Academind Node.js Course", platform: "Udemy", cost: "₹500 (sale)", duration: "2 months", type: "course", free: false, rating: 9.2 },
      ],
    },
    {
      id: "phase-4",
      title: "Full Stack Projects & Job Prep",
      duration: "10–12 weeks",
      skills: ["Next.js", "Full-stack integration", "Deployment (Vercel, AWS)", "Docker basics", "Performance", "System design basics", "LeetCode (medium)"],
      projects: ["Full e-commerce app", "Real-time chat app", "SaaS dashboard clone"],
      milestones: ["3 full-stack projects on GitHub", "Resume ready", "First job application sent"],
      resources: [
        { title: "Next.js Docs", platform: "nextjs.org", cost: "Free", duration: "Self-paced", type: "course", free: true },
        { title: "System Design Primer", platform: "github.com/donnemartin", cost: "Free", duration: "3 weeks", type: "course", free: true },
        { title: "LeetCode Top 150", platform: "leetcode.com", cost: "Free (basic)", duration: "Ongoing", type: "tool", free: true },
      ],
    },
  ],
  projects: [
    {
      title: "Personal Portfolio Website",
      description: "Build a stunning portfolio with your projects, skills, and contact info. Deploy it on Vercel.",
      difficulty: "beginner",
      skills: ["HTML", "CSS", "JavaScript"],
      timeEstimate: "1–2 weeks",
      portfolioImpact: 7,
    },
    {
      title: "Full-Stack Todo App",
      description: "React frontend + Node.js API + PostgreSQL. Include auth, CRUD, and deployment.",
      difficulty: "intermediate",
      skills: ["React", "Node.js", "PostgreSQL", "JWT"],
      timeEstimate: "2–3 weeks",
      portfolioImpact: 8,
    },
    {
      title: "Real-Time Chat Application",
      description: "WebSocket-based chat with rooms, typing indicators, and file sharing.",
      difficulty: "intermediate",
      skills: ["React", "Socket.io", "Node.js", "MongoDB"],
      timeEstimate: "3–4 weeks",
      portfolioImpact: 9,
    },
    {
      title: "E-Commerce Platform",
      description: "Full product listing, cart, payment (Razorpay), orders, and admin dashboard.",
      difficulty: "advanced",
      skills: ["Next.js", "PostgreSQL", "Stripe/Razorpay", "TypeScript"],
      timeEstimate: "6–8 weeks",
      portfolioImpact: 10,
    },
    {
      title: "AI-Powered SaaS Tool",
      description: "Integrate Claude/OpenAI API to build a useful tool — resume generator, content writer, etc.",
      difficulty: "advanced",
      skills: ["Next.js", "AI APIs", "Supabase", "Stripe"],
      timeEstimate: "4–6 weeks",
      portfolioImpact: 10,
    },
  ],
  salaryProjections: [
    { year: 0, label: "Fresher (0 yr)", minSalary: 4, maxSalary: 7, role: "Junior Developer" },
    { year: 1, label: "1 Year", minSalary: 7, maxSalary: 12, role: "Frontend/Backend Dev" },
    { year: 2, label: "2 Years", minSalary: 10, maxSalary: 18, role: "Full-Stack Developer" },
    { year: 3, label: "3 Years", minSalary: 15, maxSalary: 28, role: "Senior Developer" },
    { year: 5, label: "5 Years", minSalary: 25, maxSalary: 45, role: "Lead Developer / Staff Eng" },
    { year: 8, label: "8 Years", minSalary: 40, maxSalary: 80, role: "Principal Eng / Architect" },
    { year: 10, label: "10+ Years", minSalary: 60, maxSalary: 130, role: "CTO / Engineering Director" },
  ],
  sevenDayPlan: [
    { day: 1, title: "Setup & Foundation", tasks: ["Install VS Code + extensions", "Create GitHub account", "Learn HTML basics (headings, links, images)", "Build a simple webpage"], timeRequired: "2–3 hours", goal: "First webpage live on GitHub Pages" },
    { day: 2, title: "CSS Fundamentals", tasks: ["Learn CSS selectors, properties", "Flexbox crash course (Flexbox Froggy)", "Style your webpage from Day 1", "Learn basic responsive design"], timeRequired: "2–3 hours", goal: "Styled, responsive webpage" },
    { day: 3, title: "JavaScript Basics", tasks: ["Variables, data types, functions", "DOM manipulation (console.log, querySelector)", "Build a button click counter", "Learn about events"], timeRequired: "2–3 hours", goal: "Interactive webpage" },
    { day: 4, title: "JavaScript Deep Dive", tasks: ["Arrays, objects, loops", "ES6 features (arrow functions, destructuring)", "Fetch API - call a public API", "Build a simple weather widget"], timeRequired: "3 hours", goal: "API-connected widget" },
    { day: 5, title: "React Introduction", tasks: ["Install Node.js + npm", "Create React app (Vite)", "Learn components, props, useState", "Build a todo list component"], timeRequired: "3 hours", goal: "First React component" },
    { day: 6, title: "Git & Deployment", tasks: ["Learn git add, commit, push", "Create GitHub repo", "Deploy to Vercel (free)", "Share your deployed link"], timeRequired: "2 hours", goal: "Live deployed project" },
    { day: 7, title: "Review & Plan", tasks: ["Review what you learned", "Identify weak areas", "Set up 30-day roadmap", "Join a developer community (Discord, Reddit)"], timeRequired: "1–2 hours", goal: "Clear next 30 days" },
  ],
  thirtyDayPlan: [
    { week: 1, theme: "HTML/CSS Mastery", goals: ["Complete responsive portfolio website", "Learn CSS Grid and Flexbox", "Study 30 HTML/CSS concepts"], deliverable: "Deployed portfolio at yourname.vercel.app" },
    { week: 2, theme: "JavaScript Core", goals: ["Complete javascript.info chapters 1–9", "Build 3 small JS projects", "Understand async/await"], deliverable: "3 JavaScript mini-projects on GitHub" },
    { week: 3, theme: "React Fundamentals", goals: ["Complete React official tutorial", "Build todo app with state", "Learn React Router basics"], deliverable: "React todo app deployed" },
    { week: 4, theme: "First Full Project", goals: ["Plan and build a small full project", "Connect to a public API", "Deploy on Vercel", "Share on LinkedIn"], deliverable: "Full project with README on GitHub" },
  ],
  ninetyDayPlan: [
    { month: 1, theme: "Foundations Complete", milestones: ["HTML/CSS/JS mastered", "3 projects on GitHub", "Portfolio live", "Active on GitHub daily"], successMetric: "Can build any static website and knows JavaScript basics" },
    { month: 2, theme: "React + Backend Basics", milestones: ["React fundamentals strong", "Built 2 React apps", "Node.js + Express basics", "First API built and deployed"], successMetric: "Can build full-stack CRUD applications" },
    { month: 3, theme: "Job-Ready Mode", milestones: ["3 strong portfolio projects", "LeetCode Easy/Medium practice", "Resume polished", "5 internship applications sent", "First interview scheduled"], successMetric: "First internship or job offer received" },
  ],
  commonMistakes: [
    "Tutorial hell — watching tutorials without building projects",
    "Skipping JavaScript fundamentals and jumping to React",
    "Not using Git from Day 1",
    "Building CRUD apps only — not solving real problems",
    "Ignoring TypeScript — it's now a must-have",
    "Not deploying projects publicly",
    "Applying for jobs before having 3 strong projects",
    "Skipping system design completely",
  ],
  backupCareers: ["Mobile App Developer", "DevOps Engineer", "Product Manager", "AI/ML Engineer"],
  startupIdeas: [
    "SaaS tool for Indian SMBs (billing, inventory)",
    "EdTech platform for vernacular language learning",
    "Developer tools / productivity SaaS",
    "AI-powered content tool for creators",
    "Hyperlocal marketplace for a Tier-2 city",
  ],
};

// ── AI/ML Engineer Template ──────────────────────────────────

const aimlTemplate: RoadmapTemplate = {
  careerId: "aiml",
  beginnerSkills: ["Python programming", "Statistics fundamentals", "Linear algebra basics", "Pandas & NumPy", "Data visualization (Matplotlib)"],
  intermediateSkills: ["Scikit-learn", "Supervised learning", "Unsupervised learning", "Feature engineering", "Model evaluation", "SQL for data", "Deep learning basics"],
  advancedSkills: ["Neural networks (CNNs, RNNs, Transformers)", "NLP & LLMs", "Computer vision", "MLOps", "Cloud ML (SageMaker/Vertex)", "Distributed training"],
  futureProofSkills: ["LLM fine-tuning", "Multimodal AI", "AI agents", "RLHF", "Edge AI/TinyML", "AI safety basics"],
  phases: [
    {
      id: "phase-1",
      title: "Python & Math Foundation",
      duration: "8–10 weeks",
      skills: ["Python", "NumPy", "Pandas", "Matplotlib", "Linear Algebra", "Statistics & Probability", "Calculus basics"],
      projects: ["EDA on Indian dataset (IPL, election data)", "Statistical analysis report"],
      milestones: ["Comfortable with Python data structures", "Can do EDA on any dataset"],
      resources: [
        { title: "Python for Everybody", platform: "Coursera / U Michigan", cost: "Free (audit)", duration: "2 months", type: "course", free: true },
        { title: "Khan Academy Linear Algebra", platform: "khanacademy.org", cost: "Free", duration: "3 weeks", type: "course", free: true },
        { title: "Kaggle Python & Pandas", platform: "kaggle.com/learn", cost: "Free", duration: "2 weeks", type: "course", free: true },
      ],
    },
    {
      id: "phase-2",
      title: "Machine Learning Core",
      duration: "10–12 weeks",
      skills: ["Scikit-learn", "Linear/Logistic regression", "Decision trees", "Random forests", "SVM", "K-means clustering", "Cross-validation", "Feature engineering"],
      projects: ["House price predictor (India data)", "Customer churn classifier", "Kaggle competition entry"],
      milestones: ["Completed Andrew Ng's ML course", "3 ML projects on Kaggle"],
      resources: [
        { title: "Machine Learning Specialization", platform: "Coursera / Andrew Ng", cost: "Free (audit)", duration: "3 months", type: "course", free: true, rating: 10 },
        { title: "Hands-On ML with Scikit-Learn (book)", platform: "O'Reilly", cost: "₹3,000", duration: "2 months", type: "book", free: false, rating: 9.5 },
        { title: "Kaggle Competitions", platform: "kaggle.com", cost: "Free", duration: "Ongoing", type: "tool", free: true },
      ],
    },
    {
      id: "phase-3",
      title: "Deep Learning & NLP",
      duration: "12–14 weeks",
      skills: ["TensorFlow/Keras", "PyTorch", "CNNs", "RNNs / LSTMs", "Transformers", "BERT/GPT basics", "NLP pipeline", "Transfer learning"],
      projects: ["Image classifier (Indian food/landmarks)", "Sentiment analysis (Twitter India data)", "Simple chatbot"],
      milestones: ["Completed deeplearning.ai specialization", "1 deep learning project deployed"],
      resources: [
        { title: "Deep Learning Specialization", platform: "Coursera / deeplearning.ai", cost: "Free (audit)", duration: "4 months", type: "course", free: true, rating: 10 },
        { title: "Fast.ai Practical Deep Learning", platform: "fast.ai", cost: "Free", duration: "2 months", type: "course", free: true, rating: 9.8 },
        { title: "Andrej Karpathy YouTube", platform: "YouTube", cost: "Free", duration: "Self-paced", type: "channel", free: true },
      ],
    },
    {
      id: "phase-4",
      title: "MLOps + LLMs + Job Ready",
      duration: "10–12 weeks",
      skills: ["MLflow", "Docker for ML", "AWS SageMaker / GCP Vertex", "LLM APIs (OpenAI, Claude)", "RAG systems", "Model monitoring", "A/B testing models"],
      projects: ["End-to-end ML pipeline", "LLM-powered app", "Open source contribution"],
      milestones: ["Production ML system deployed", "Resume with 4 strong projects", "Applied to 10+ roles"],
      resources: [
        { title: "MLOps Specialization", platform: "Coursera / deeplearning.ai", cost: "Free (audit)", duration: "2 months", type: "course", free: true },
        { title: "AWS ML Specialty prep", platform: "A Cloud Guru / Udemy", cost: "₹2,000", duration: "6 weeks", type: "course", free: false },
        { title: "LangChain / LlamaIndex docs", platform: "GitHub", cost: "Free", duration: "Self-paced", type: "tool", free: true },
      ],
    },
  ],
  projects: [
    { title: "Indian Stock Price Predictor", description: "Use LSTM to predict NSE/BSE stock prices. Deploy as a web app.", difficulty: "intermediate", skills: ["Python", "LSTM", "Flask", "Pandas"], timeEstimate: "3 weeks", portfolioImpact: 8 },
    { title: "Hindi Sentiment Analyzer", description: "NLP model to analyze sentiment in Hindi/Hinglish social media posts.", difficulty: "intermediate", skills: ["NLP", "Transformers", "Hugging Face"], timeEstimate: "4 weeks", portfolioImpact: 9 },
    { title: "Crop Disease Detection", description: "CNN to identify crop diseases from photos — relevant to India's agriculture.", difficulty: "intermediate", skills: ["CNN", "TensorFlow", "OpenCV"], timeEstimate: "3 weeks", portfolioImpact: 9 },
    { title: "AI Resume Screener", description: "ML pipeline to rank resumes by job fit. Build end-to-end with API.", difficulty: "advanced", skills: ["NLP", "FastAPI", "Docker", "PostgreSQL"], timeEstimate: "5 weeks", portfolioImpact: 10 },
    { title: "RAG-Powered Study Assistant", description: "Upload study material, ask questions, get AI answers. LLM + vector DB.", difficulty: "advanced", skills: ["LLMs", "LangChain", "Pinecone", "Streamlit"], timeEstimate: "4 weeks", portfolioImpact: 10 },
  ],
  salaryProjections: [
    { year: 0, label: "Fresher (0 yr)", minSalary: 6, maxSalary: 12, role: "ML Engineer / Data Analyst" },
    { year: 1, label: "1 Year", minSalary: 10, maxSalary: 20, role: "Junior ML Engineer" },
    { year: 2, label: "2 Years", minSalary: 18, maxSalary: 35, role: "ML Engineer" },
    { year: 3, label: "3 Years", minSalary: 28, maxSalary: 50, role: "Senior ML Engineer" },
    { year: 5, label: "5 Years", minSalary: 45, maxSalary: 80, role: "Staff ML Engineer / ML Lead" },
    { year: 8, label: "8 Years", minSalary: 70, maxSalary: 130, role: "Principal ML / AI Director" },
    { year: 10, label: "10+ Years", minSalary: 100, maxSalary: 200, role: "VP AI / Chief AI Officer" },
  ],
  sevenDayPlan: [
    { day: 1, title: "Python Setup", tasks: ["Install Python + Anaconda", "Learn lists, dicts, functions", "NumPy array operations", "Pandas DataFrame basics"], timeRequired: "3 hours", goal: "Comfortable with Python data structures" },
    { day: 2, title: "Data Analysis", tasks: ["Load CSV with Pandas", "Basic EDA (describe, info, null check)", "Matplotlib basic charts", "Explore a Kaggle dataset"], timeRequired: "3 hours", goal: "Can analyze a dataset" },
    { day: 3, title: "Statistics Basics", tasks: ["Mean, median, mode, std", "Normal distribution", "Correlation basics", "Probability fundamentals"], timeRequired: "2 hours", goal: "Statistical foundation solid" },
    { day: 4, title: "First ML Model", tasks: ["Install scikit-learn", "Linear regression from scratch", "Train/test split", "Evaluate with MSE, R²"], timeRequired: "3 hours", goal: "First working ML model" },
    { day: 5, title: "Classification", tasks: ["Logistic regression", "Decision tree classifier", "Accuracy, precision, recall", "Confusion matrix"], timeRequired: "3 hours", goal: "Classification model built" },
    { day: 6, title: "Kaggle Debut", tasks: ["Join Kaggle", "Download Titanic dataset", "Submit first prediction", "Study top notebooks"], timeRequired: "3 hours", goal: "First Kaggle submission" },
    { day: 7, title: "Learning Path", tasks: ["Sign up for Andrew Ng course", "Set up GitHub with 1 project", "Join ML India Discord", "Plan month 1 goals"], timeRequired: "2 hours", goal: "Clear roadmap and first public project" },
  ],
  thirtyDayPlan: [
    { week: 1, theme: "Python + Math", goals: ["Finish Python fundamentals", "Complete NumPy/Pandas", "Statistics basics done"], deliverable: "EDA notebook on Kaggle dataset" },
    { week: 2, theme: "ML Foundations", goals: ["Andrew Ng Week 1–3", "Linear/Logistic regression", "Feature engineering basics"], deliverable: "Regression project on GitHub" },
    { week: 3, theme: "ML Models", goals: ["Trees, forests, SVM", "Model selection", "Kaggle competition join"], deliverable: "Classification project + Kaggle score" },
    { week: 4, theme: "End-to-End Project", goals: ["Full ML pipeline", "Data → model → API", "Deploy on Streamlit Cloud"], deliverable: "Live ML web app" },
  ],
  ninetyDayPlan: [
    { month: 1, theme: "ML Fundamentals Solid", milestones: ["Python + stats mastered", "5 ML models understood", "2 Kaggle submissions", "GitHub active"], successMetric: "Can explain and implement any classic ML algorithm" },
    { month: 2, theme: "Deep Learning & NLP", milestones: ["deeplearning.ai course complete", "1 CNN project", "1 NLP project", "Kaggle bronze medal"], successMetric: "Can build and train neural networks independently" },
    { month: 3, theme: "Job-Ready + MLOps", milestones: ["4 portfolio projects live", "LLM API project built", "Resume ML-focused", "10 internship applications", "1 ML interview booked"], successMetric: "Internship or research assistantship offer" },
  ],
  commonMistakes: [
    "Skipping math/statistics — it catches up with you later",
    "Only doing tutorials, not Kaggle competitions",
    "Ignoring software engineering skills (Docker, APIs, Git)",
    "Not building end-to-end projects (only Jupyter notebooks)",
    "Focusing on algorithms only, not real-world problem solving",
    "Underestimating the importance of MLOps",
    "Not specializing — trying to be expert in everything",
  ],
  backupCareers: ["Data Scientist", "Data Analyst", "ML Platform Engineer", "AI Product Manager"],
  startupIdeas: [
    "AI tool for Indian language content creation",
    "Crop disease detection SaaS for farmers",
    "Vernacular voice AI assistant",
    "AI-powered legal document analysis for India",
    "ML-powered credit scoring for rural India",
  ],
};

// Export template map
export const ROADMAP_TEMPLATES: Record<string, RoadmapTemplate> = {
  fullstack: fullstackTemplate,
  aiml: aimlTemplate,
};

export const getTemplate = (careerId: string): RoadmapTemplate | null =>
  ROADMAP_TEMPLATES[careerId] ?? null;

export const hasTemplate = (careerId: string): boolean =>
  careerId in ROADMAP_TEMPLATES;
