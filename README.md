# CareerPath AI India 🇮🇳

> AI-powered career roadmap platform for Indian students and professionals.
> Generate a personalised, actionable roadmap for any career — skills, salary, projects, certifications, and a 90-day plan.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## ⚡ Quick Start (5 minutes)

### Prerequisites
- Node.js 18 or higher
- An Anthropic API key — get one free at [console.anthropic.com](https://console.anthropic.com)

### 1 — Install dependencies
```bash
npm install
```

### 2 — Configure environment
```bash
cp .env.example .env.local
```
Open `.env.local` and set at minimum:
```
# FREE — get at https://console.groq.com
GROQ_API_KEY=gsk_your_groq_key_here
# FREE — get at https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIza_your_gemini_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
Both Groq and Gemini have generous **free tiers** — no credit card needed.
The app also works with zero API keys using built-in template roadmaps.

### 3 — Run locally
```bash
npm run dev
```
Visit → [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploy to Vercel (Recommended)

### Option A — CLI (fastest, 2 minutes)
```bash
npm install -g vercel
vercel
```
When prompted, add `ANTHROPIC_API_KEY` as an environment variable.

### Option B — GitHub Dashboard
1. Push this folder to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
3. In **Settings → Environment Variables** add:
   ```
   ANTHROPIC_API_KEY   →  sk-ant-your-key
   NEXT_PUBLIC_APP_URL →  https://your-project.vercel.app
   ```
4. Click **Deploy**

Vercel auto-detects Next.js and deploys in ~60 seconds. Free SSL included.

---

## 📱 Mobile / Android Deploy Note

The site is fully responsive and tested down to 360px wide (Android Go devices).
No special steps needed — it works on all modern mobile browsers.

If testing on a local network device:
```bash
npm run dev -- --hostname 0.0.0.0
# Then open http://YOUR_LOCAL_IP:3000 on your phone
```

---

## 🏗️ Project Structure

```
careerpath-ai/
├── app/
│   ├── api/
│   │   ├── generate-roadmap/route.ts   # AI roadmap generation (POST)
│   │   └── compare-careers/route.ts    # Career comparison (POST)
│   ├── layout.tsx          # Root layout — fonts, metadata, OG tags, JSON-LD
│   └── page.tsx            # Homepage — hero, career grid, full product flow
├── components/
│   ├── roadmap/
│   │   ├── Questionnaire.tsx   # 8-step personalisation quiz
│   │   ├── RoadmapView.tsx     # Tabbed roadmap display
│   │   ├── SalaryChart.tsx     # Recharts salary projection chart
│   │   └── ProgressTracker.tsx # Milestone tracker with XP
│   ├── shared/
│   │   ├── Navbar.tsx          # Sticky glassmorphism navbar
│   │   └── Footer.tsx          # Footer with SEO links
│   └── ui/
│       └── index.tsx           # Button, Badge, GlassCard, ProgressBar, StatCard…
├── data/
│   ├── careers.ts          # 15 career profiles with India salary/demand data
│   ├── categories.ts       # Career category definitions
│   └── templates.ts        # Pre-built roadmaps (Full Stack, AI/ML)
├── hooks/index.ts          # useRoadmapGeneration, useSavedRoadmaps, useUserProfile
├── lib/
│   ├── ai-advisor.ts       # Anthropic → OpenAI → template fallback chain
│   ├── analytics/          # PostHog / GA4 event tracking (safe, optional)
│   ├── recommendation-engine/  # Skill gap detector, career alternatives
│   └── roadmap-engine/     # Template builder, progress & XP calculators
├── public/
│   ├── robots.txt          # SEO crawl rules
│   └── sitemap.xml         # SEO sitemap
├── styles/globals.css      # Dark glassmorphism design system + mobile fixes
├── types/index.ts          # All TypeScript types
└── utils/index.ts          # cn(), formatSalary, calculateStreak, getXPLevel…
```

---

## 🔐 Environment Variables

| Variable | Required | Where to get |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes (free) | [console.groq.com](https://console.groq.com) |
| `GEMINI_API_KEY` | ✅ Yes (free fallback) | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Your domain or Vercel URL |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics |
| `RAZORPAY_KEY_ID` | Optional | For payments |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | For DB-backed auth |

See `.env.example` for the full list and security checklist.

---

## 🛡️ Security

- All AI API keys are **server-side only** — never exposed to the browser
- Per-IP rate limiting on all API routes (5 roadmaps/hour, 10 comparisons/hour)
- Burst protection (8 s minimum between requests per IP)
- All user inputs validated and bounded with Zod before reaching AI
- Anti prompt-injection sanitisation in `lib/ai-advisor.ts`
- Internal errors are never exposed to the client

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS design system |
| AI Primary | Groq (llama-3.3-70b) — free tier |
| AI Fallback | Gemini 2.0 Flash — free tier |
| Charts | Recharts |
| Validation | Zod |
| State | React hooks + localStorage |
| Deployment | Vercel (recommended) |

---

## 📄 License

Private — All rights reserved.
