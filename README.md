# 🧠 FlowState — Adaptive Workload Management Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://olam-2-0.vercel.app)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-olam--2--0.vercel.app-6366f1?style=for-the-badge)](https://olam-2-0.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![ESP32](https://img.shields.io/badge/Hardware-ESP32%20BLE-E7352C?style=for-the-badge&logo=espressif)](https://www.espressif.com/)

**Live Production URL:** [https://olam-2-0.vercel.app](https://olam-2-0.vercel.app)

---

## 📖 Overview

FlowState is an adaptive workload management platform built for university students and engineers who want to stop treating every day the same. Traditional task managers ignore your human state — how rested you are, how stressed you feel, how much cognitive energy you have left. FlowState doesn't.

The system adapts your daily task priorities **in real time** based on:
- 🛏️ **Sleep quality** — Did you get 8 hours or 4?
- ⚡ **Energy level** — Are you sharp or drained?
- 😓 **Stress level** — Are you overwhelmed or in flow?
- 📅 **Deadline urgency** — What actually needs to be done today?

The result is a **personalized, dynamic plan** that re-ranks your tasks every day, not a rigid to-do list that ignores your biology.

---

## ✨ Key Features

### 🎯 Adaptive Scheduling Engine
- Daily state slider inputs (energy, stress, sleep) used as weights in the scheduling algorithm
- Tasks auto-ranked by urgency, cognitive demand, and current capacity
- Generates a dynamic daily plan with prioritized task slots

### 📊 Live Dashboard
- Displays today's top tasks with priority scores and deadlines
- Shows current cognitive state as visual indicators
- Desk Companion widget with live BLE connection status

### 📋 Task Manager
- Full CRUD interface for tasks
- Fields: title, category, due date, estimated duration, priority, cognitive demand
- Tasks linked per user via Supabase row-level security

### 🗺️ Daily Planner
- Visual timeline of today's schedule
- Adapter scores shown per task slot
- Re-runs whenever daily state changes

### 📈 State History & Insights
- 7-day history chart of energy, stress, and sleep patterns pulled from live Supabase data
- Dynamic chart bars colored by state intensity
- AI-generated insights and weekly analysis (Groq-powered)
- Category distribution and completion trend breakdowns

### ⚙️ Settings & Devices
- Profile management and theme preferences
- Device connection panel for ESP32 Desk Companion (BLE & Serial)
- Connection status tracking with real-time sync toggle

---

## 🔩 Hardware — ESP32 Desk Companion

FlowState includes a **physical desk companion** built on an ESP32 microcontroller with a 240×320 TFT display (GTM028-05 V1.1).

### What it displays
Instead of a generic timer, the display shows your **top 2 prioritized tasks** in real time:
- Task title (with automatic word-wrap)
- Category badge
- Priority level indicator
- Adaptive plan summary footer

### How it connects
The companion device advertises a BLE GATT service. The web app connects via **Web Bluetooth API** directly in the browser — no native app needed.

On connection, the web app sends a JSON payload over BLE every time the task plan updates:

```json
{
  "task1": "Finish ML assignment",
  "cat1": "Academic",
  "pri1": "High",
  "task2": "Review lecture notes",
  "cat2": "Study",
  "pri2": "Medium",
  "summary": "2 high-priority tasks remaining"
}
```

### Firmware

The Arduino sketch lives in [`FlowState_H1/FlowState_H1.ino`](./FlowState_H1/FlowState_H1.ino).

**Libraries required (install via Arduino Library Manager):**
- `TFT_eSPI` — Display driver
- `ArduinoJson` — JSON payload parsing
- `BLE` (built into ESP32 Arduino core)

**Board:** ESP32 Dev Module (tested with ESP32-WROOM-32)

**Flashing:**
1. Open `FlowState_H1.ino` in Arduino IDE
2. Select board: **ESP32 Dev Module**
3. Select the correct COM port
4. Hold the **BOOT** button while clicking Upload if auto-reset fails
5. Release BOOT once upload begins

> **BLE Service UUID:** `12345678-1234-1234-1234-123456789012`
> **BLE Characteristic UUID:** `abcdefab-cdef-abcd-efab-cdefabcdefab`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  FlowState Web App (Next.js 15)          │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Dashboard   │  │   Planner    │  │   Insights   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         └─────────────────┴──────────────────┘           │
│                           │                              │
│  ┌────────────────────────▼───────────────────────────┐  │
│  │           FlowStateProvider (Context)               │  │
│  │   dailyState → schedulingEngine → tasks/plan        │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────▼───────────────────────────┐  │
│  │         useFlowStateBLE (BLE Hook)                  │  │
│  │   Serializes plan → JSON → BLE GATT Write           │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼─────────────────────────────┘
                            │ Web Bluetooth API (BLE)
                            ▼
                ┌───────────────────────┐
                │  ESP32 Desk Companion  │
                │  TFT 240×320 Display   │
                │  Shows Top-2 Tasks     │
                └───────────────────────┘

┌─────────────────────────────────────────┐
│         Backend (Supabase)              │
│  Postgres + Auth (JWT) + RLS            │
│  Tables: tasks, profiles,               │
│          daily_states, plans            │
└─────────────────────────────────────────┘

┌───────────────────────────┐
│   AI Layer (Groq)         │
│   Insight generation      │
│   Weekly analysis         │
│   Schedule suggestions    │
└───────────────────────────┘
```

---

## 📁 Project Structure

```
bluebee/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── (auth)/                   # Auth routes (login, signup)
│   ├── app/                      # Protected app routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── tasks/                # Task manager
│   │   ├── planner/              # Daily planner
│   │   ├── state/                # Daily state input + 7-day history
│   │   ├── insights/             # Analytics & AI insights
│   │   └── settings/             # Profile & device settings
│   ├── api/                      # API route handlers
│   └── onboarding/               # First-run onboarding flow
│
├── components/                   # Shared React components
│   ├── BLECompanionWidget.tsx    # Desk companion connection card
│   ├── FlowStateProvider.tsx     # Core state/context provider
│   └── ...
│
├── lib/                          # Utility & integration libs
│   ├── bluetooth/
│   │   └── useFlowStateBLE.ts   # BLE hook (Web Bluetooth API)
│   ├── data/
│   │   ├── tasks.ts             # Task CRUD operations
│   │   ├── state.ts             # Daily state + history queries
│   │   └── plans.ts             # Plan management
│   ├── ai/                      # Groq AI integration
│   └── scheduling/              # Adaptive scheduling engine
│
├── FlowState_H1/                # ESP32 Firmware
│   └── FlowState_H1.ino         # Arduino sketch (BLE + TFT display)
│
├── supabase/                    # Database migrations & schema
├── types/                       # Shared TypeScript types
└── public/                      # Static assets
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key
- *(Optional)* Arduino IDE + ESP32 board for the hardware companion

### 1. Clone and install

```bash
git clone <repo-url>
cd bluebee
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Groq AI (server-side only — never expose to the client)
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-120b

# Deployment
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Set up the database

```bash
npx supabase db push
```

Or apply the SQL files in `supabase/migrations/` manually from the Supabase dashboard SQL editor.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — if port 3000 is taken, Next.js falls back to 3001.

---

## 🔵 Connecting the Desk Companion (BLE)

1. Flash the ESP32 with `FlowState_H1/FlowState_H1.ino`
2. Power on the ESP32 — it advertises as **FlowState-H1**
3. Open the web app → **Settings → Devices**
4. Click **"Scan & Connect"** and select **FlowState-H1** from the browser picker
5. Your top 2 tasks sync automatically whenever the plan updates

> ⚠️ **Web Bluetooth** requires a Chromium-based browser (Chrome, Edge, Brave) and HTTPS or localhost. Safari and Firefox are not supported.

---

## 🤖 AI Integration (Groq)

The insights page uses the Groq API to generate:
- Personalized productivity insights from 7-day state history
- Weekly performance analysis
- Recommendations for balancing cognitive load

All AI calls are made **server-side** via Next.js API routes to keep the API key secure.

---

## 🛢️ Database Schema (Supabase)

| Table | Description |
|---|---|
| `profiles` | User profile data (name, timezone, preferences) |
| `tasks` | Task records with priority, deadline, duration, cognitive demand |
| `daily_states` | Per-day energy / stress / sleep slider values |
| `plans` | Generated daily plans with ranked task slots |

All tables use **Row-Level Security (RLS)** — users can only read and write their own data.

---

## 🌐 Deployment

Deployed on **Vercel** with automatic deploys from the `main` branch.

**Production URL:** [https://olam-2-0.vercel.app](https://olam-2-0.vercel.app)

Configure the same environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React, TypeScript |
| **Styling** | Tailwind CSS |
| **Backend** | Supabase (Postgres + Auth + RLS) |
| **AI** | Groq API |
| **Hardware** | ESP32 + TFT_eSPI + ArduinoJson |
| **Connectivity** | Web Bluetooth API (BLE GATT) |
| **Deployment** | Vercel |

---

> Built for hackathon — FlowState is a research-driven prototype exploring **human-adaptive task scheduling** with physical IoT integration.
