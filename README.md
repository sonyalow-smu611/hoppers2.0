# Hoppers

Hoppers is a cafe discovery app built for people who need a good spot now: students finding a study table, remote workers looking for Wi-Fi-friendly cafes, friend groups choosing a meetup place, and cafe hoppers searching beyond the usual recommendations.

Instead of making users jump between maps, reviews, saved notes, and social posts, Hoppers combines nearby cafe discovery, AI-assisted recommendations, community reviews, and personal saved lists in one flow.

## Live Demo

Hoppers is deployed on Vercel and ready to demo. The hosted deployment runs the Next.js frontend with API requests routed to the deployed Express backend.

Frontend: [**hoppers2-0.vercel.app**](https://hoppers2-0.vercel.app/)

## Hackathon Pitch

Choosing a cafe is often slower than it should be. The "best" option depends on context: distance, budget, purpose, rating, atmosphere, photos, and whether a place fits today's plan. Hoppers turns that scattered decision into a guided experience:

1. Share your location and preferences.
2. Get matched with nearby cafes using live place data and AI ranking.
3. Explore cafes on a map, read community posts, and save places for later.

## Demo Flow

- Start on the map to discover nearby cafes around your current location.
- Use search and the sidebar to inspect cafe results.
- Open preferences, choose budget, purpose, distance, and optional notes.
- View AI-ranked recommendations with short match explanations.
- Sign in to save cafes, mark places as visited, and write reviews.
- Browse the feed to see community cafe posts.

## Features

- Live cafe discovery with Google Maps and Google Places.
- AI cafe recommender that ranks nearby cafes from user preferences.
- Deterministic distance filtering before AI ranking for reliable local results.
- Rating-based fallback when AI matching is unavailable.
- Cafe detail views with reviews.
- Authenticated saved cafe list.
- "Been There" tracking for visited cafes.
- Community feed for cafe reviews and photos.
- Supabase persistence for cafes, lists, users, and posts.
- Clerk authentication for protected user actions.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, shadcn-style UI components.
- Backend: Express.js on Node.js.
- Hosting: Vercel.
- Auth: Clerk.
- Database: Supabase.
- Maps and place data: Google Maps Platform and Google Places API.
- AI recommendations: DeepSeek chat API through the OpenAI-compatible SDK.

## Repository Structure

```text
.
├── frontend/       # Next.js app: map, recommendations, auth pages, feed, saved lists
├── backend/        # Express API: cafes, lists, posts, users, AI recommendations
├── PRD.md          # Product requirements and planned MVP scope
└── README.md       # Hackathon submission overview
```

## Local Development

### Prerequisites

- Node.js 20 or later
- npm
- Supabase project
- Clerk application
- Google Maps Platform API key with Maps JavaScript API and Places API access
- DeepSeek API key for AI-powered recommendations

### 1. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create environment files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend variables:

```bash
DEEPSEEK_API_KEY=
GOOGLE_PLACES_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
PORT=4000
```

Frontend variables:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/feed
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/feed
BACKEND_URL=http://localhost:4000
```

`NEXT_PUBLIC_API_BASE_URL` is optional. In local development, the frontend rewrites API requests to `BACKEND_URL`.

### 3. Run the App Locally

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

## Deployment

The project is already hosted on Vercel for hackathon review. For local development, `frontend/next.config.mjs` rewrites frontend API calls to `BACKEND_URL`, so the same route structure works locally and in production as long as the deployed frontend has the production backend origin configured in Vercel environment variables.

Required production environment variables should be configured in Vercel for the relevant frontend and backend deployments:

- Clerk keys and redirect URLs.
- Supabase URL, anon key, and service role key.
- Google Maps and Google Places API keys.
- DeepSeek API key.
- Backend origin exposed to the frontend as `BACKEND_URL`.

## API Overview

- `POST /cafes/sync` searches nearby cafes from Google Places and syncs them to Supabase in the background.
- `GET /cafes` returns cafes stored in Supabase.
- `GET /cafes/photo` proxies Google Places photo media.
- `POST /api/recommend` returns AI-ranked cafe recommendations for a preference payload.
- `GET /posts` and `POST /posts` support the community review feed.
- `GET /lists/saved-list`, `POST /lists/saved-list`, and related list routes support saved and visited cafes.
- `GET /protected` verifies Clerk-authenticated backend access.

## Current Prototype Status

Implemented for the hackathon prototype:

- Map-based cafe discovery.
- AI recommendation flow.
- User authentication.
- Saved cafes and visited cafes.
- Review feed and post creation.
- Supabase-backed API routes.

Planned next:

- Real-time cafe condition feedback for crowd, noise, and temperature.
- Deals and promotions.
- Group voting rooms for friends choosing a cafe together.
- Richer cafe owner tools.

## Why It Matters

Hoppers helps users make faster, more contextual cafe decisions. The prototype demonstrates a practical path toward a social discovery layer for cafes: live local data, personal preference matching, and community memory in a single product.
