---
description: 
globs: 
alwaysApply: true
---
# GitHub Copilot Instructions for the "Karaoke Queue" Project

This document provides the architectural and technical guidelines for the Karaoke Queue Next.js application. Please adhere to these instructions when providing code suggestions and completions.

## 1. Development Plan Reference

**Important**: Please refer to the comprehensive development plan located at `plan.md` for:

- Detailed project roadmap and current development status
- Phase-by-phase implementation strategy
- Technical specifications and requirements

The `plan.md` file contains the authoritative source of truth for project status, priorities, and architectural decisions. Always consult this file when making development decisions or assessing current progress.

## 2. Project Overview

The goal is to build a real-time web application for managing a karaoke night. The system has two main parts: a secure **Host Dashboard** for managing the queue, and a public **Attendee Sign-up Form**. The application must be fast, type-safe, and built on a modern technology stack.

## 3. Core Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Package Manager:** Bun
- **Database:** Supabase (Postgres)
- **ORM:** Prisma (for all database interactions)
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime Subscriptions
- **UI:** Tailwind CSS with `shadcn/ui` components
- **State Management:** React Query (TanStack Query) for server state; Zustand for minimal client state.
- **Server-side Logic:** Next.js Server Actions and Route Handlers (`/app/api`).
- **Testing:** Vitest (Unit & Integration), Playwright (E2E)
- **Validation:** Zod

**Note:** Use `bun add` for installing packages and `bunx` for running package binaries (e.g., `bunx prisma ...`).

---

## 4. File Organization and Component Architecture

### Proactive Component Design (MANDATORY)

**NEVER** write large, monolithic components that require refactoring later. Always design components correctly from the start.

1.  **Define Clear Boundaries**: Before writing any component, determine its single responsibility, props, state, and side effects.
2.  **Separate Concerns Immediately**:
    - Extract types to separate `.types.ts` files.
    - Move utility functions to `.utils.ts` files.
    - Create custom hooks for ALL complex logic, state management, and side effects.
    - Split UI into focused, single-purpose sub-components.
3.  **Start Small, Stay Small**: Begin with minimal functionality and split immediately when approaching 50 lines.

### File and Component Size Limits

- **Maximum component file size**: 125 lines (HARD LIMIT).
- **Target component file size**: 100 lines (IDEAL RANGE).
- **Immediate Action**: Split any file approaching 150 lines. Don't wait.

### Security and Compliance Mandate

**Note:** The file size and modular structure guidelines outlined below are **non-negotiable security requirements**.

- **Vulnerability Prevention:** Large, monolithic files are a significant security risk. They are difficult to review, audit, and test, making it easy for vulnerabilities, insecure logic, or backdoors to be introduced and remain hidden.
- **Strict Enforcement:** Adherence to the 150-line limit and the feature-based folder structure is mandatory. Any code that violates these rules will be considered a security vulnerability and must be refactored immediately before it can be merged.
- **Auditability:** Small, single-purpose modules are essential for maintaining a clear and auditable codebase. This ensures that every piece of logic can be easily isolated and verified for security compliance.

Failure to comply with these structural rules compromises the integrity and security of the entire application.

### Component Splitting Strategy

When planning ANY component, automatically structure it into feature-based folders.

**Example Structure:**

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── [eventSlug]/
│   │   │   ├── components/
│   │   │   │   ├── QueueTable.tsx
│   │   │   │   ├── QueueControls.tsx
│   │   │   │   └── YouTubeCard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useQueueSubscription.ts
│   │   │   │   └── useQueueMutations.ts
│   │   │   ├── page.tsx (<100 lines, composition only)
│   │   │   └── types.ts
├── lib/
│   ├── prisma.ts
│   ├── queue-logic.ts
│   └── supabase-client.ts
```

### Key Module Locations

- **Prisma Client:** Singleton instance exported from `/lib/prisma.ts`.
- **Supabase Client:** Client-side instance exported from `/lib/supabase-client.ts`.
- **Core Business Logic:** "Fairness Algorithm" implemented in `/lib/queue-logic.ts`.
- **Server Actions:** All server-side mutations located in `/app/actions/`.
- **Authentication:** Middleware at `/middleware.ts`.
- **API Routes:** Route Handlers located in `/app/api/`.

---

## 5. Prisma Schema Definition (`schema.prisma`)

All database interactions MUST use the Prisma Client. The schema below is the source of truth for our data models.

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL") // From Supabase Connection Pooling
  directUrl = env("DIRECT_URL")   // From Supabase Direct Connection
}

// Enum for performance types
enum PerformanceType {
  Solo
  Duo
  Group
}

// Enum for signup status
enum SignupStatus {
  Waiting
  Singing
  Done
}

// Stores host user data, linked to Supabase Auth
model Profile {
  id     String  @id @default(uuid())
  email  String? @unique
  events Event[]
}

// Represents a single karaoke event
model Event {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique // For the shareable URL
  eventDate   DateTime @default(now())
  hostId      String
  host        Profile  @relation(fields: [hostId], references: [id])
  signups     Signup[]

  @@index([hostId])
}

// Represents a single singer's signup in the queue
model Signup {
  id              String          @id @default(uuid())
  createdAt       DateTime        @default(now())
  singerName      String
  songTitle       String
  artist          String
  performanceType PerformanceType @default(Solo)
  status          SignupStatus    @default(Waiting)
  queuePosition   Int

  eventId String
  event   Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
}
```

---

## 6. Security & Authentication

- **Row Level Security (RLS):** RLS must be enabled on the `Profile`, `Event`, and `Signup` tables. Policies should ensure hosts can only manage their own events and that public access is appropriately restricted.
- **Authentication Flow:** Host login will be handled on a `/login` page. The `middleware.ts` file will protect all routes under the `/dashboard` group.

---

## 7. Core Features & Implementation Notes

- **Attendee Sign-up Form (`/[eventSlug]/signup`):**
  - Build with `shadcn/ui` components.
  - Use `Zod` and `React Hook Form`.
- **Add Singer Server Action (`/app/actions/add-singer.ts`):**
  - Validate with Zod.
  - Invoke "Fairness Algorithm" from `/lib/queue-logic.ts`.
  - Create `Signup` record using Prisma.
  - Call `revalidatePath()`.
- **Host Dashboard (`/dashboard/[eventSlug]`):**
  - Fetch data using a Server Action.
  - Use React Query's `useQuery` to call the action.
  - Display the queue in a `<Table>` component (which must be a separate component, e.g., `QueueTable.tsx`).

---

## 8. Real-time & Advanced Functionality

- **Real-time Updates:**
  - Create a `useQueueSubscription` custom hook.
  - Subscribe to `signups` table changes.
  - On update, call `queryClient.invalidateQueries`.
- **Queue Management:**
  - Use React Query's `useMutation` to call Server Actions for status updates.
  - Implement optimistic updates for a smoother UX.
- **YouTube Integration:**
  - Create a Route Handler at `/app/api/youtube-search/route.ts`.
- **QR Code Generation:**
  - Use `qrcode.react` inside a `shadcn/ui` `<Dialog>`.

---

## 9. UI/UX Guidelines

- **Responsiveness:** All pages must be fully responsive for both mobile and desktop views.
- **Loading States:** Use skeletons or spinners to indicate when data is being fetched.
- **User Feedback:** Use toasts or alerts to provide clear feedback for all user actions.
