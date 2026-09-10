# Karaoke Queue

A real-time web application for managing karaoke nights with a secure host dashboard and public attendee sign-up form. Built with modern technologies for fast, type-safe, and responsive performance.

## 🎤 Features

- **Host Dashboard**: Secure interface for managing karaoke events and queue
- **Real-time Updates**: Live queue updates using Supabase Realtime
- **Public Sign-up**: Easy-to-use form for attendees to join the queue
- **YouTube Integration**: Search and display karaoke tracks with prioritized results
- **Queue Management**: Fair ordering algorithm with drag-and-drop reordering
- **Event Sharing**: QR codes and shareable links for easy access
- **Mobile Responsive**: Optimized for all device sizes

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Package Manager**: Bun
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime Subscriptions
- **UI**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query + Zustand
- **Testing**: Vitest (Unit) + Playwright (E2E)
- **Validation**: Zod

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- Bun package manager
- Supabase account and project

### Installation

1. Clone the repository:

```bash
git clone https://github.com/savg92/karaoke-queue
cd karaoke-queue
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
DATABASE_URL="your-supabase-connection-string"
DIRECT_URL="your-supabase-direct-connection-string"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
YOUTUBE_API_KEY="your-youtube-api-key" # Optional
```

4. Set up the database:

```bash
bunx prisma generate
bunx prisma db push
```

5. Run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Host dashboard routes
│   │   ├── actions/           # Server actions
│   │   │   ├── types/         # Action type definitions
│   │   │   └── utils/         # Action utilities
│   │   ├── api/               # API routes (YouTube search)
│   │   ├── auth/              # Auth callback routes
│   │   ├── dashboard-simple/  # Simplified dashboard view
│   │   └── event/             # Public event pages
│   ├── components/            # Reusable UI components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utilities and configurations
│   │   ├── supabase/         # Supabase client setup
│   │   ├── hooks/            # Custom React hooks
│   │   └── validators/       # Zod schemas
│   └── middleware.ts         # Next.js middleware
├── prisma/                   # Database schema and migrations
├── tests/                    # Test files
├── scripts/                  # Build and utility scripts
└── public/                   # Static assets
```

## 🎯 Usage

### For Hosts

1. **Sign In**: Go to `/login` and enter your email to receive a magic link
2. **Access Dashboard**: Click the magic link in your email to authenticate
3. **Create Event**: Use the dashboard to create a new karaoke event
4. **Share Event**: Generate QR codes or copy shareable links
5. **Manage Queue**: View, reorder, and update performer status in real-time

### For Attendees

1. **Join Event**: Scan QR code or visit the event URL
2. **Sign Up**: Fill out the simple form with your song choice
3. **Wait**: View your position in the queue with real-time updates

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
bun test

# E2E tests
bun test:e2e

# Run all tests
bun test:all
```

## 🏗️ Building

Create a production build:

```bash
bun run build
```

Start the production server:

```bash
bun start
```

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Configuration

### Environment Variables

- `DATABASE_URL`: Supabase connection string for Prisma
- `DIRECT_URL`: Supabase direct connection (for migrations)
- `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL`: (Optional) Your production domain URL (e.g., `https://your-domain.com`)
- `YOUTUBE_API_KEY`: YouTube Data API v3 key (optional)

**Note**: The `NEXT_PUBLIC_SITE_URL` variable is used for authentication redirects in production. If not set, the app will attempt to auto-detect the domain from request headers or fall back to Vercel's automatically provided `VERCEL_URL`.

**Note**: Remember to update the authentication URL in Supabase settings to match your production domain.

### Database Setup

The application uses Prisma with Supabase PostgreSQL. Key tables:

- `Profile`: User accounts (linked to Supabase Auth)
- `Event`: Karaoke events created by hosts
- `Signup`: Individual sign-ups in the queue

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the coding guidelines
4. Run tests and ensure build passes
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
