# Karaoke Queue - Robust Project Development Plan

This document outlines the detailed, step-by-step plan for building the Karaoke Queue application. Each phase includes specific technical tasks, architectural decisions, and testing requirements to ensure a high-quality, secure, and maintainable product.

---

## Phase 0: Project Setup & Foundation (Initial Setup)

**Goal:** Establish a clean, modern, and type-safe foundation for the project.

- [x] **Initialize Next.js Project:**
  - [x] Run `bun create next ./karaoke-queue`.
  - [x] **Clean up boilerplate:**
    - [x] Remove default styles from `globals.css`.
    - [x] Clear the content of `page.tsx`.
- [x] **Install Core Dependencies:**
  - [x] Install `shadcn/ui`: `bunx shadcn-ui@latest init`.
  - [x] Install Prisma: `bun add prisma --dev`.
  - [x] Install Supabase helpers: `bun add @supabase/auth-helpers-nextjs @supabase/ssr`.
  - [x] Install React Query: `bun add @tanstack/react-query`.
  - [x] Install Zod and React Hook Form: `bun add zod react-hook-form @hookform/resolvers`.
  - [x] Install Testing Libraries: `bun add vitest @vitest/ui @playwright/test --dev`.
  - [x] Setup Playwright: `bunx playwright install`.
- [x] **Set up Supabase Project:**
  - [x] Create a new project on the Supabase dashboard.
  - [x] Securely save the Project URL, `anon` key, and database connection strings.
- [x] **Configure Environment Variables:**
  - [x] Create a `.env.local` file in the project root.
  - [x] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - [x] Add placeholders for `DATABASE_URL`, `DIRECT_URL`, and `YOUTUBE_API_KEY`.
- [ ] **Initialize Git Repository:**
  - [ ] Run `git init`.
  - [ ] Create a `.gitignore` file (Next.js provides a good default).
  - [ ] Create `README.md`, `plan.md`, and `.github/copilot-instruction.md`.
  - [ ] Make the initial commit: `feat: initial project setup and configuration`.
  - [ ] Create a new repository on GitHub and push the initial commit.

---

## Phase 1: Database & Type Safety

**Goal:** Define a robust data layer with a clear schema, connect it to the database, and ensure type safety across the application.

- [x] **Integrate Prisma:**
  - [x] Initialize Prisma: `bunx prisma init`.
  - [x] Configure `schema.prisma` with the `postgresql` provider.
- [x] **Define Prisma Schema (`schema.prisma`):**
  - [x] Copy the defined schemas for `Profile`, `Event`, and `Signup`.
  - [x] Define the `PerformanceType` and `SignupStatus` enums.
  - [x] Verify all relations and indexes are correctly defined.
- [x] **Connect Prisma to Supabase:**
  - [x] Get the database connection pool URL from the Supabase dashboard.
  - [x] Add `DATABASE_URL` (for connection pooling) and `DIRECT_URL` (for migrations) to `.env.local`.
- [x] **Run Initial Migration & Generate Client:**
  - [x] Push the schema to the database: `bunx prisma db push`.
  - [x] Verify that the tables (`Profile`, `Event`, `Signup`) have been created in the Supabase Table Editor.
  - [x] Generate the Prisma Client: `bunx prisma generate`.
- [ ] **Create Prisma Client Instance:**
  - [ ] Create a file at `src/lib/prisma.ts` to export a singleton Prisma Client instance, ensuring it's not re-initialized in development.
- [ ] **Create Seed Script (Optional but Recommended):**
  - [ ] Create a `prisma/seed.ts` file to populate the database with development data (e.g., a sample host and event).

---

## Phase 2: Security & Authentication

**Goal:** Implement a secure authentication system and enforce strict data access policies using RLS.

- [ ] **Set Up Supabase Row Level Security (RLS):**
  - [ ] In the Supabase SQL Editor, enable RLS on the `Profile`, `Event`, and `Signup` tables.
  - [ ] **Define and run SQL policies:**
    - `Profiles`: Users can only view/edit their own profile.
    - `Events`: Hosts can only view/manage their own events. Public can read event details (name, slug).
    - `Signups`: Hosts can manage signups for their events. Authenticated users can create signups. Public access is denied.
- [x] **Integrate Supabase Auth Helper:**
  - [x] Create a `src/lib/supabase/client.ts` to export a client-side Supabase client.
  - [x] Create a `src/lib/supabase/server.ts` to export server-side and middleware clients.
  - [x] Set up the middleware (`src/middleware.ts`) to manage user sessions and refresh tokens.
- [x] **Implement Host Login Flow:**
  - [x] Create a route group `(auth)` with a `/login` page.
  - [x] Build a simple login form using `shadcn/ui` components.
  - [x] Create a Server Action to handle email/password or magic link sign-in using the Supabase client.
- [x] **Create Protected Routes & User Context:**
  - [x] Create a `/account` route.
  - [x] Use the middleware to protect all routes under `/account`, redirecting unauthenticated users to `/login`.
  - [ ] Create a `useUser` hook to easily access the authenticated user's data in client components.

---

## Phase 3: Core Application Features

**Goal:** Build the primary features of the application: the public sign-up form and the host's management dashboard.

- [ ] **Build Attendee Sign-up Form (`/event/[eventSlug]`):**
  - [ ] Create the page at `src/app/event/[eventSlug]/page.tsx`.
  - [ ] **Component Breakdown:**
    - `SignupForm.tsx`: The main form component.
    - `Zod Schema`: Define a schema in `src/lib/validators/signup.ts` for `singerName`, `songTitle`, `artist`, etc.
  - [ ] Use `React Hook Form` with the Zod resolver for robust client-side validation.
  - [ ] Use `shadcn/ui` (`Card`, `Input`, `Select`, `Button`) to build an intuitive form.
- [ ] **Create New Signup Server Action:**
  - [ ] Create the action at `src/app/actions/add-singer.ts`.
  - [ ] **Implement "Fairness Algorithm"** in `src/lib/queue-logic.ts`. This pure function should take the current queue and determine the optimal `queuePosition` for a new singer.
  - [ ] The action must:
    1.  Validate input with the Zod schema.
    2.  Use Prisma to fetch the current queue for the event.
    3.  Call the fairness algorithm to get the new position.
    4.  Create the new `Signup` record.
    5.  Call `revalidatePath('/dashboard/[eventSlug]')` to clear the cache.
- [ ] **Build Host Dashboard UI (`/dashboard/[eventSlug]`):**
  - [ ] Create the page at `src/app/(dashboard)/[eventSlug]/page.tsx`.
  - [ ] **Component Breakdown:**
    - `QueueTable.tsx`: A `shadcn/ui` `<Table>` to display the list of signups.
    - `QueueControls.tsx`: Buttons for managing the queue.
  - [ ] Create a Server Action to fetch the queue data for the event, ordered by `queuePosition`.
  - [ ] Use React Query's `useQuery` to call this action and display the data, providing server-state management.

---

## Phase 4: Real-time & Advanced Functionality

**Goal:** Enhance the host dashboard with real-time updates, management controls, and helpful integrations.

- [ ] **Implement Real-time Updates:**
  - [ ] Create a `useQueueSubscription` custom hook in `src/app/(dashboard)/[eventSlug]/hooks/useQueueSubscription.ts`.
  - [ ] The hook should use the client-side Supabase client to subscribe to `INSERT`, `UPDATE`, and `DELETE` events on the `signups` table for the current event.
  - [ ] On receiving a new event, call `queryClient.invalidateQueries` with the queue's query key to trigger a re-fetch.
  - [ ] Apply the hook to the Host Dashboard page.
- [ ] **Build Queue Management Controls:**
  - [ ] Add "Mark as Singing," "Mark as Done," and "Remove" buttons to the `QueueTable.tsx`.
  - [ ] Create new Server Actions (`updateSignupStatus.ts`, `removeSignup.ts`) that use Prisma to modify signups.
  - [ ] Use React Query's `useMutation` to call these actions from the UI, handling loading states and providing optimistic updates for a seamless UX.
- [ ] **Integrate YouTube API:**
  - [ ] Get a YouTube Data API v3 key from the Google Cloud Console and add it to `.env.local`.
  - [ ] Create a Next.js Route Handler at `/app/api/youtube-search/route.ts`. This route should be protected and only accessible by authenticated hosts.
  - [ ] On the dashboard, when a singer is marked as "Singing," trigger a fetch to this API route and display the top 3 results in a `YouTubeCard.tsx` component.
- [ ] **Implement QR Code Generation:**
  - [ ] Install `qrcode.react`: `bun add qrcode.react`.
  - [ ] Add a button on the dashboard that opens a `shadcn/ui` `<Dialog>`.
  - [ ] Inside the dialog, display the QR code component, passing it the full public URL of the attendee sign-up page.

---

## Phase 5: Finalization & Deployment

**Goal:** Polish the application, conduct thorough testing, and deploy it to production.

- [ ] **UI/UX Polishing:**
  - [ ] Ensure the application is fully responsive on mobile and desktop.
  - [ ] Add subtle animations and transitions for a more polished feel.
  - [ ] Add loading states (spinners, skeletons) for all data-fetching operations.
  - [ ] Implement a toast system (using `shadcn/ui`) for user feedback (e.g., "Signup successful!", "Error updating queue.").
- [ ] **Comprehensive Testing:**
  - [ ] **Unit Tests (Vitest):**
    - Write tests for critical business logic, especially the `queue-logic.ts` fairness algorithm.
  - [ ] **Integration Tests (Vitest):**
    - Test Server Actions to ensure they interact with the database correctly.
  - [ ] **End-to-End (E2E) Tests (Playwright):**
    - [ ] Write E2E tests for the main user flows: host login, attendee signup, and queue management.
    - [ ] Test edge cases like invalid form submissions and empty states.
- [ ] **Deployment to Vercel:**
  - [ ] Connect the GitHub repository to a new Vercel project.
  - [ ] Configure all environment variables from `.env.local` in the Vercel project settings.
  - [ ] Trigger a production deployment from the `main` branch.
  - [ ] Test the deployed application thoroughly to ensure all features work as expected.
