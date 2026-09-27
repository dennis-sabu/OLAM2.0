# FlowState — Full Project Specification

> **Adaptive Student Workload Manager with AI Assistance and ESP32-S3 Companion Display**

---

## 1. Project Overview

**FlowState** is a student productivity and wellbeing-focused web application that helps students manage academic and personal responsibilities according to the time and capacity they realistically have each day.

Instead of behaving like a normal to-do list that simply stores tasks, FlowState continuously answers:

> **What should I keep today, what should I reduce, what can move, and what is the minimum I need to accomplish today?**

The system combines:

- Academic and personal task management
- Deadline and priority tracking
- Daily capacity estimation
- Energy and stress check-ins
- Adaptive workload planning
- KEEP / REDUCE / MOVE decisions
- Minimum Viable Day planning
- Explainable scheduling decisions
- AI-assisted natural-language task entry
- User authentication and personalized data
- Supabase persistence
- An ESP32-S3 physical companion display

The core scheduler is deterministic and explainable. AI is used where it is useful: understanding natural-language input and converting it into structured task data.

---

# 2. Core Problem

Students often have more work than they can realistically complete in one day.

A student may have:

- Assignments
- Exams
- Projects
- Lab work
- Study sessions
- Personal responsibilities
- Deadlines
- Different levels of priority
- Different amounts of available time each day

Most productivity applications mainly answer:

> "What tasks do you have?"

FlowState answers:

> "Given your workload and today's available capacity, what should you realistically do?"

The project therefore focuses on **workload negotiation and realistic planning**, rather than simply task storage.

---

# 3. Product Philosophy

FlowState is built around five principles:

1. **Do not force everything into one day.**
2. **Prioritize based on consequences and urgency.**
3. **Make trade-offs visible instead of hiding them.**
4. **Explain why the system made a planning decision.**
5. **Help the student protect the most important work first.**

FlowState is not a medical or mental-health diagnosis tool. Energy and stress are used as self-reported planning signals, not as medical measurements.

---

# 4. Main Product Concept

FlowState compares:

```text
                    WORKLOAD
                       |
          +------------+------------+
          |            |            |
        Tasks       Deadlines    Priorities
          |            |            |
          +------------+------------+
                       |
                       v
                WORKLOAD MODEL
                       |
                       |
                       v
                    VS.
                       |
                 DAILY CAPACITY
                       |
          +------------+------------+
          |            |            |
     Available Time  Energy       Stress
          |            |            |
          +------------+------------+
                       |
                       v
              ADAPTIVE SCHEDULER
                       |
          +------------+------------+
          |            |            |
        KEEP        REDUCE        MOVE
          +------------+------------+
                       |
                       v
             MINIMUM VIABLE DAY
                       |
                       v
                 DAILY PLAN
```

---

# 5. Main Functionalities

## 5.1 User Authentication

FlowState uses Supabase Authentication.

### Supported authentication

- Email + password sign up
- Email + password sign in
- Sign out
- Session persistence
- Password reset
- Optional Google sign-in if configuration is convenient

### User profile

The profile can store:

- Name
- Email
- Profile image/avatar
- Timezone
- Typical daily available study time
- Preferred study hours
- Preferred break duration
- Default task priorities

Authentication makes all tasks, plans, wellness information, and history user-specific.

---

# 6. Website Structure

The application consists of the following major routes/screens.

```text
/
├── Landing Page
│
├── /auth
│   ├── sign-in
│   ├── sign-up
│   └── reset-password
│
└── /app
    ├── dashboard
    ├── tasks
    ├── planner
    ├── daily-state
    ├── history
    ├── insights
    ├── device
    └── settings
```

The exact route names can be changed during implementation, but the functionality should remain.

---

# 7. Landing Page

The landing page uses the approved visual direction from the reference design:

- Premium dark background
- Black / deep navy surfaces
- Purple/violet glow
- Large elegant serif headline
- Modern sans-serif UI text
- Glass-like cards
- Bento dashboard preview
- Rounded corners
- Subtle borders
- Smooth but restrained motion

## Hero section

Suggested headline:

> **Your workload shouldn't control your entire day.**

Supporting text:

> FlowState helps students decide what matters today based on the time and capacity they actually have.

Primary actions:

- **Build My Day**
- **See How It Works**

## Landing page sections

1. Hero
2. Problem explanation
3. How FlowState works
4. KEEP / REDUCE / MOVE explanation
5. Minimum Viable Day
6. AI task entry demonstration
7. Physical ESP32 companion demonstration
8. Product dashboard preview
9. Call to action
10. Footer

---

# 8. Dashboard

The dashboard is the main home screen after login.

## Dashboard sections

### Greeting

Examples:

- Good morning, Dennis
- Good afternoon
- Good evening

### Capacity summary

Display:

- Available time
- Estimated planning capacity
- Current workload
- Workload overload/remaining capacity

Example:

```text
Today's Capacity     3h 10m
Today's Workload     5h 30m
Overload             2h 20m
```

### Capacity visualization

A visual meter or progress bar indicates how much of the student's capacity is occupied.

States:

- Comfortable
- Tight
- Overloaded

### Today's Plan

Show scheduled tasks and their decisions:

- KEEP
- REDUCE
- MOVE

### Minimum Viable Day card

Display the minimum set of critical tasks that should happen today.

### Current Task

Show the task the student should currently be working on.

### Quick actions

- Add task
- Update daily state
- Plan my day
- View planner
- Complete current task

### Recent activity

Examples:

- Task completed
- Task moved
- Daily plan updated
- AI task added

---

# 9. Task Management

## Task creation

A task contains:

- Title
- Description (optional)
- Category
- Deadline
- Estimated duration
- Priority
- Optional importance level
- Optional subtasks/milestones
- Status

### Categories

Initial categories:

- Academic
- Project
- Exam
- Personal
- Routine
- Other

### Priority

- Low
- Medium
- High

### Status

- Pending
- In Progress
- Completed
- Missed
- Archived

---

# 10. Manual Task Creation

The normal task form contains:

```text
Task title
Description
Category
Deadline
Estimated duration
Priority
Importance
Optional milestones
```

Buttons:

- Save Task
- Cancel

Validation:

- Title required
- Duration must be positive
- Deadline must be valid
- Priority required

---

# 11. AI Natural-Language Task Entry

This is the main AI feature.

The student can type:

> "I have an electronics assignment due Thursday. It will take around two hours and it's important."

The AI extracts structured data.

Example result:

```json
{
  "title": "Electronics Assignment",
  "category": "Academic",
  "deadline": "2026-10-01",
  "estimatedMinutes": 120,
  "priority": "high"
}
```

The student must review and confirm the extracted information before the task is inserted into Supabase.

## AI responsibilities

AI can:

- Extract task title
- Infer category
- Extract relative/absolute deadlines
- Estimate stated duration
- Infer priority from natural language
- Suggest milestones for large tasks

AI should NOT directly decide KEEP / REDUCE / MOVE.

The deterministic scheduler makes those decisions.

---

# 12. Task Details Page

Clicking a task opens a detailed view.

Display:

- Title
- Description
- Category
- Deadline
- Estimated time
- Time remaining until deadline
- Priority
- Current status
- Planning decision
- Planned time
- Remaining time
- Milestones
- Reason for decision
- History of updates

Actions:

- Start
- Complete
- Mark as missed
- Edit
- Delete
- Reschedule

---

# 13. Planner

The planner shows the student's planned day as a timeline.

Example:

```text
09:30  Mathematics       45m   KEEP
10:30  Electronics       60m   KEEP
11:30  Break             15m
11:45  Project           45m   REDUCE
14:00  Java Practice     --    MOVE
```

## Planner interactions

- View day
- View week
- Start task
- Complete task
- Mark incomplete
- Reschedule task
- Open task details
- See why task was assigned to a state

---

# 14. Daily State

This is the student's self-reported current state.

Inputs:

- Energy: 1–10
- Stress: 1–10
- Available study time
- Optional sleep hours
- Optional note

Optional context tags:

- Too many assignments
- Exam pressure
- Poor sleep
- Personal responsibilities
- Low energy
- Other

The data is used as a planning signal, not a medical assessment.

---

# 15. Capacity Engine

FlowState calculates an estimated planning capacity.

A simple baseline formula is:

```text
Base capacity = available time

Energy factor = 0.70 + (energy / 10 × 0.30)

Stress factor = 1.00 - (stress / 10 × 0.20)

Planning capacity =
available time × energy factor × stress factor
```

Example:

```text
Available time = 4h
Energy = 6/10
Stress = 5/10

Energy factor = 0.88
Stress factor = 0.90

Planning capacity = 4 × 0.88 × 0.90
                  = 3.168h
                  ≈ 3h 10m
```

The exact coefficients can be tuned during development.

These values are for workload planning only and should not be presented as clinical measurements.

---

# 16. Workload Calculation

Daily workload is calculated from relevant tasks.

Example:

```text
Mathematics        60m
Electronics        90m
Java               60m
Project           120m

Total = 330m = 5h 30m
```

The system then compares:

```text
Workload vs Planning Capacity
```

Possible states:

- Under capacity
- Near capacity
- Over capacity

---

# 17. Adaptive Scheduler

The scheduler is deterministic and explainable.

Each task receives a planning score based on factors such as:

```text
45% Deadline urgency
30% User priority
15% Importance/dependency
10% Effort fit
```

The exact weighting can be tuned after testing.

## Deadline urgency example

```text
Due today         100
Due tomorrow       90
Due in 2 days      75
Due in 3–4 days    55
Due in 5–7 days    35
More than 7 days   20
```

## Priority example

```text
High      100
Medium     60
Low        30
```

---

# 18. KEEP / REDUCE / MOVE

## KEEP

Use when a task should be prioritized today and fits within the available planning capacity.

Example explanation:

> Kept because it is high priority and due tomorrow.

## REDUCE

Use when a task is important but cannot be fully completed today.

For example:

```text
Project total effort = 120m
Available block today = 45m

REDUCE
45m today
75m remaining
```

The system should not pretend that the whole task is complete.

If task milestones exist, the scheduler can select the relevant milestone.

If milestones do not exist, REDUCE means allocating a focused work block and carrying the remainder forward.

## MOVE

Use when a task is less urgent or lower consequence relative to today's more important work.

Example:

> Moved because the deadline is several days away and today's capacity is limited.

---

# 19. Minimum Viable Day

The Minimum Viable Day is a dedicated feature.

Definition:

> **The smallest realistic set of actions that protects the student's most important responsibilities today.**

Example:

```text
Total workload = 7h 20m
Capacity = 3h

Minimum Viable Day:

✓ Submit Electronics assignment     60m
✓ Prepare for tomorrow's exam       90m
✓ Complete critical project step    30m

Total = 3h
```

The system can present other tasks as:

> Can safely move.

---

# 20. Handling Impossible Workloads

If all tasks are urgent and the workload exceeds capacity, FlowState must not pretend the conflict has been solved.

Example:

```text
Workload = 7h
Capacity = 3h
```

Show:

```text
Capacity conflict

You have approximately 4h more work than today's estimated capacity.

FlowState selected the highest-impact work for today.
The remaining work needs to be rescheduled or given additional time.
```

This is an intentional product behavior.

---

# 21. Explainability

Every planning decision has a reason.

### KEEP

> Kept because it is high priority and due tomorrow.

### REDUCE

> Reduced because the task is important but cannot fit completely within today's capacity.

### MOVE

> Moved because the deadline is farther away and today's capacity is limited.

### Minimum Viable Day

> These tasks were selected because they have the highest urgency or consequence if delayed.

The explanation should be generated from deterministic rules, not from an LLM.

---

# 22. Task Completion Flow

When a student completes a task:

```text
Task status
Pending
   ↓
In Progress
   ↓
Completed
```

The system then:

1. Updates Supabase
2. Recalculates remaining workload
3. Updates the planner
4. Updates the dashboard
5. Updates progress/insights
6. Updates the ESP32 companion later

---

# 23. Missed Task Flow

If the student fails to complete a task:

```text
Task
 ↓
Mark incomplete
 ↓
Remaining workload recalculated
 ↓
Priorities recalculated
 ↓
KEEP / REDUCE / MOVE recalculated
 ↓
Planner updated
```

The objective is to adapt rather than simply create a larger overdue list.

---

# 24. History

FlowState maintains a history of:

- Completed tasks
- Missed tasks
- Rescheduled tasks
- Daily capacity
- Daily workload
- Planning decisions
- Wellness check-ins

This enables the student to see how their workload changes over time.

---

# 25. Insights

A basic insights page can show:

- Tasks completed this week
- Tasks missed
- Average daily workload
- Average planning capacity
- Completion percentage
- Most common task categories
- Workload overload frequency
- Time spent on academic tasks
- Time moved to future days

Example:

```text
This week

Completed         18 tasks
Moved              6 tasks
Missed             2 tasks

Average workload   4h 50m
Average capacity   4h 05m

Overload occurred on 3 days
```

The insights must remain descriptive and should not make health claims.

---

# 26. Settings

Settings can include:

- Profile
- Name
- Preferred study hours
- Default daily capacity
- Default task category
- Default priority
- Theme
- Notifications preference
- Account settings
- Sign out

---

# 27. Device Page

The Device page controls the ESP32-S3 companion.

Display:

- Device connected/disconnected
- Last sync time
- Current task
- Device status
- Firmware version (optional)

Possible future settings:

- Refresh interval
- Display brightness
- Auto-cycle tasks
- Show current task only

---

# 28. Full Software Architecture

```text
                           FLOWSTATE
                              |
                              v
                     +-------------------+
                     |     Next.js       |
                     | React + TypeScript|
                     | Tailwind CSS      |
                     +---------+---------+
                               |
            +------------------+------------------+
            |                  |                  |
            v                  v                  v
       Auth / User         Task System        Daily State
            |                  |                  |
            +------------------+------------------+
                               |
                               v
                     +-------------------+
                     | Adaptive Engine   |
                     |                   |
                     | Capacity          |
                     | Deadline          |
                     | Priority          |
                     | Effort            |
                     +---------+---------+
                               |
                +--------------+--------------+
                |              |              |
                v              v              v
              KEEP           REDUCE         MOVE
                +--------------+--------------+
                               |
                               v
                     Minimum Viable Day
                               |
                               v
                         Daily Planner
                               |
                               v
                         +-----------+
                         | Supabase  |
                         | PostgreSQL|
                         +-----------+
                               ^
                               |
                         Groq AI API
                         (task parsing)
```

---

# 29. Supabase Data Model

## users / auth.users

Managed by Supabase Auth.

## profiles

Suggested columns:

```text
id
name
email
avatar_url
timezone
preferred_study_start
preferred_study_end
default_daily_minutes
created_at
updated_at
```

## tasks

```text
id
user_id
title
description
category
deadline
estimated_minutes
priority
importance
status
source
created_at
updated_at
```

`source` can be:

- manual
- ai

## task_milestones

Optional but useful for REDUCE.

```text
id
task_id
title
estimated_minutes
position
status
created_at
```

## wellness_logs / daily_states

```text
id
user_id
energy
stress
sleep_hours
available_minutes
notes
created_at
```

## daily_plans

```text
id
user_id
date
task_id
decision
planned_minutes
scheduled_start
scheduled_end
status
reason
created_at
updated_at
```

## task_activity

```text
id
user_id
task_id
action
metadata
created_at
```

Possible actions:

- created
- started
- completed
- missed
- rescheduled
- reduced
- moved

---

# 30. Supabase Security

Use Row Level Security.

Each table containing user-owned data should restrict access based on the authenticated user's ID.

Conceptually:

```text
User A
  |
  +--> only rows where user_id = A

User B
  |
  +--> only rows where user_id = B
```

The Groq API key must remain server-side.

Use:

```env
GROQ_API_KEY=...
```

Do not use:

```env
NEXT_PUBLIC_GROQ_API_KEY=...
```

---

# 31. API / Server Routes

Suggested server-side routes:

```text
POST   /api/ai/parse-task
POST   /api/ai/break-task
POST   /api/planner/generate
POST   /api/planner/replan
GET    /api/planner/today
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/dashboard
```

Not every route must exist separately if Server Actions or another clean architecture is preferred. The functional responsibilities should remain.

---

# 32. AI Architecture

```text
Student input
     |
     v
Next.js server route
     |
     v
Groq API
     |
     v
Structured JSON
     |
     v
Schema validation
     |
     v
Preview for user confirmation
     |
     v
Supabase
```

Use schema validation before writing AI-generated data into the database.

The AI should never be trusted blindly.

---

# 33. AI Features

## AI Task Extraction

Natural language -> task JSON.

## AI Task Breakdown

Large task -> suggested milestones.

Example:

```text
Complete 10-page project report

Suggested milestones:
1. Research
2. Outline
3. First draft
4. Review
5. Final edits
```

The student confirms before saving.

## Optional AI Input Assistant

The user can give multiple tasks in one message:

> "Tomorrow I have my electronics assignment and a Java quiz. The assignment will take 90 minutes and the quiz needs about an hour."

AI returns multiple structured tasks.

---

# 34. Design System

## Overall style

Premium dark SaaS application inspired by the provided visual reference.

### Colors

```text
Background:      #08080B
Surface:         #111116
Surface 2:       #17171D
Primary Purple:  #7C3AED
Bright Purple:   #A855F7
Soft Lavender:   #C4B5FD
Primary Text:    #F5F3FF
Muted Text:      #A1A1AA
```

Use status colors carefully:

```text
KEEP       subtle green
REDUCE     amber
MOVE       muted purple/gray
OVERLOAD   red/orange accent
```

## Typography

Suggested:

- Elegant serif for major marketing headlines
- Geist/Inter-like sans-serif for application UI

## UI language

- Large rounded cards
- Glass-like surfaces
- Fine borders
- Soft glow
- Strong whitespace
- Clear hierarchy
- Minimal unnecessary decoration

## Animation

Use subtle Motion/Framer Motion style animation only where it improves feedback.

Examples:

- Task completion animation
- Planner reordering
- Capacity transition
- Card entrance
- State change

Avoid excessive animation.

---

# 35. Hardware Companion

The hardware is an extension of the software, not the core source of truth.

## Main hardware

- ESP32-S3
- 0.96-inch OLED display (SSD1306 or compatible I2C display)
- USB cable
- Breadboard
- Jumper wires

Optional:

- RGB LED
- Push button
- Buzzer
- Rotary encoder

For the initial hardware prototype, the **ESP32-S3 + one OLED display** is enough.

---

# 36. Hardware Purpose

The device provides a physical view of the student's current FlowState task without requiring the student to constantly open the dashboard.

It can display:

- Current task
- Task status
- Remaining planned time
- Completion state
- Sync state

Example:

```text
+----------------+
| CURRENT TASK   |
|                |
| ELECTRONICS    |
|                |
| 45 MIN         |
|                |
| IN PROGRESS    |
+----------------+
```

After completion:

```text
+----------------+
|       ✓        |
|                |
| ELECTRONICS    |
|                |
|   COMPLETED    |
+----------------+
```

---

# 37. Hardware Communication Architecture

The web application and Supabase remain the source of truth.

```text
                    FLOWSTATE WEB
                         |
                         v
                     SUPABASE
                         |
                   Current task data
                         |
                         v
                   Device endpoint
                         |
                    HTTPS / Wi-Fi
                         |
                         v
                     ESP32-S3
                         |
                         v
                       OLED
```

For the first prototype, the ESP32 can poll a small server endpoint periodically.

A more advanced real-time implementation can be added later if there is enough time.

---

# 38. Hardware Data

The device only needs a small payload.

Example:

```json
{
  "taskId": "123",
  "title": "Electronics Assignment",
  "status": "in_progress",
  "remainingMinutes": 45
}
```

For the completed state:

```json
{
  "taskId": "123",
  "title": "Electronics Assignment",
  "status": "completed",
  "remainingMinutes": 0
}
```

---

# 39. Optional Physical Controls

If time permits, add one or more buttons.

### Button 1 — Next Task

Cycles through current/next tasks.

### Button 2 — Complete

Can mark the current task completed.

### Button 3 — Refresh

Immediately fetches the latest state.

These are optional. The first working hardware prototype can simply display current Supabase state.

---

# 40. Hardware Display States

## Connected

```text
FLOWSTATE
Connected
```

## Loading

```text
Syncing...
```

## Task available

```text
ELECTRONICS
45 MIN
IN PROGRESS
```

## Completed

```text
✓ ELECTRONICS
COMPLETED
```

## No current task

```text
NO ACTIVE TASK

Check your FlowState plan
```

## Network error

```text
OFFLINE
Last sync:
2m ago
```

---

# 41. Hardware Expansion Ideas

These are optional future improvements:

- RGB indicator for workload state
- Physical Start button
- Physical Complete button
- Ambient notification light
- Buzzer for session completion
- Rotary encoder for navigation
- Small enclosure
- Desk stand

The hardware should stay simple enough that it does not compromise the main web application.

---

# 42. Full End-to-End User Flow

```text
Landing Page
      |
      v
Sign Up / Sign In
      |
      v
Dashboard
      |
      +---------------------+
      |                     |
      v                     v
Add Task                Daily State
      |                     |
      v                     v
Manual / AI          Energy / Stress /
Task Entry           Available Time
      |                     |
      +----------+----------+
                 |
                 v
          Capacity Engine
                 |
                 v
         Workload Calculator
                 |
                 v
         Adaptive Scheduler
                 |
       +---------+---------+
       |         |         |
       v         v         v
     KEEP      REDUCE     MOVE
       +---------+---------+
                 |
                 v
       Minimum Viable Day
                 |
                 v
             Planner
                 |
        +--------+--------+
        |                 |
        v                 v
   Complete            Missed
        |                 |
        +--------+--------+
                 |
                 v
             Replanning
                 |
                 v
            Supabase
                 |
                 v
           ESP32-S3
                 |
                 v
              OLED
```

---

# 43. Example User Scenario

A student starts the morning with:

```text
Electronics assignment     90m   High   Due tomorrow
Math revision              60m   High   Due tomorrow
Java practice              60m   Medium Due Friday
Project                    120m  High   Due next week
Reading                    45m   Low    Due next week
```

Total workload:

```text
6h 15m
```

Student reports:

```text
Available time = 4h
Energy = 5/10
Stress = 7/10
```

FlowState calculates reduced planning capacity.

It then produces:

```text
KEEP
- Electronics
- Math revision

REDUCE
- Project: 45m focused block

MOVE
- Java practice
- Reading
```

Minimum Viable Day:

```text
Electronics
Math revision
Critical project work
```

Later, the student marks Electronics completed.

FlowState recalculates the remaining day.

The ESP32 then displays the current active task.

---

# 44. Dashboard Data Relationships

The dashboard should be calculated from real database data rather than hard-coded demo values.

```text
Auth User
  |
  +--> Tasks
  |      |
  |      +--> Workload
  |
  +--> Daily State
  |      |
  |      +--> Capacity
  |
  +--> Daily Plan
         |
         +--> Current Task

Current Task
  |
  +--> ESP32 display
```

---

# 45. Error Handling

The product should gracefully handle:

- AI API unavailable
- Supabase unavailable
- Empty task list
- Invalid task input
- Expired session
- Network failure on ESP32
- Missing deadline
- Invalid duration
- Scheduler conflict

The core planner should still work without AI.

If Groq fails:

> Show a message that AI entry is temporarily unavailable and allow manual task creation.

---

# 46. Offline/Fallback Philosophy

The software should not depend entirely on AI.

Core features must continue to work using:

- Manual task creation
- Deterministic scheduling
- Supabase data

AI is an enhancement, not the foundation.

---

# 47. Final Feature List

## Account

- Sign up
- Sign in
- Sign out
- Password reset
- Profile

## Tasks

- Create
- Read
- Edit
- Delete
- Complete
- Miss
- Reschedule
- Categories
- Priority
- Deadlines
- Duration
- Milestones

## AI

- Natural-language task entry
- Structured extraction
- Task breakdown
- Optional multi-task extraction

## Planning

- Workload calculation
- Capacity calculation
- Deadline scoring
- Priority scoring
- KEEP
- REDUCE
- MOVE
- Minimum Viable Day
- Replanning
- Explainability

## Daily State

- Energy
- Stress
- Available time
- Sleep (optional)
- Daily notes (optional)

## Analytics

- Completion history
- Missed tasks
- Moved tasks
- Average workload
- Average capacity
- Weekly overview

## Hardware

- ESP32-S3
- OLED display
- Current task
- Task status
- Remaining time
- Completed state
- Network/sync status

---

# 48. Suggested Project Folder Structure

```text
flowstate/
│
├── app/
│   ├── (marketing)/
│   ├── auth/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── planner/
│   │   ├── daily-state/
│   │   ├── history/
│   │   ├── insights/
│   │   ├── device/
│   │   └── settings/
│   └── api/
│       ├── ai/
│       ├── planner/
│       ├── tasks/
│       └── device/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── tasks/
│   ├── planner/
│   ├── wellness/
│   └── device/
│
├── lib/
│   ├── supabase/
│   ├── planner/
│   ├── ai/
│   ├── validation/
│   └── utils/
│
├── types/
│
├── public/
│
├── supabase/
│   ├── migrations/
│   └── seed/
│
├── hardware/
│   └── esp32-flowstate/
│
├── PLAN.md
├── README.md
└── package.json
```

---

# 49. Development Order

The implementation should follow this dependency order:

```text
1. Project foundation
        ↓
2. Supabase connection
        ↓
3. Authentication
        ↓
4. Database schema + RLS
        ↓
5. Task CRUD
        ↓
6. Daily State
        ↓
7. Workload calculation
        ↓
8. Capacity calculation
        ↓
9. KEEP / REDUCE / MOVE engine
        ↓
10. Minimum Viable Day
        ↓
11. Planner UI
        ↓
12. Dashboard
        ↓
13. AI task extraction
        ↓
14. History / Insights
        ↓
15. UI polish
        ↓
16. Deployment
        ↓
17. ESP32 integration
        ↓
18. Final demo testing
```

This order ensures the core product exists before optional integrations.

---

# 50. Success Criteria

FlowState is considered functionally complete when a new user can:

1. Create an account.
2. Sign in.
3. Add multiple tasks.
4. Set deadlines, duration and priority.
5. Enter today's energy, stress and available time.
6. See total workload and estimated capacity.
7. Generate a daily plan.
8. See KEEP / REDUCE / MOVE decisions.
9. Read why each decision was made.
10. View a Minimum Viable Day.
11. Complete a task.
12. Mark a task incomplete.
13. See the planner adapt.
14. Add a task through natural language with AI.
15. View history/insights.
16. See the current task on the ESP32 display.
17. See the display change when the task status changes.

---

# 51. Final Product Statement

> **FlowState is an adaptive student workload manager that compares a student's responsibilities with the capacity they actually have today. It helps students decide what to KEEP, what to REDUCE, what to MOVE, and what their Minimum Viable Day should look like. AI makes task entry natural, deterministic planning keeps decisions explainable, Supabase stores personalized data, and an ESP32-S3 companion provides a physical view of the student's current task and status.**

---

# 52. Core Differentiator

FlowState is not trying to help students do more tasks.

It helps them **make better workload trade-offs**.

The core question is:

> **"What can I realistically accomplish today, and what can safely wait?"**

That is the central product principle for the entire implementation.
