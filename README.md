# Traveloop Pro AI

Traveloop Pro AI (formerly GlobeX AI) is an intelligent, self-hosted travel planning application. It replaces dozens of open tabs by providing a single platform to plan, budget, and organize your trips using AI.

## Features
- **AI-Powered Itineraries:** Generate day-by-day travel plans, complete with activities, hidden gems, and dining options using Google's Gemini AI.
- **Smart Budgeting:** Automatic cost estimation for flights, hotels, food, and transport.
- **3D Interactive Globe:** Spin, zoom, and explore a cinematic 3D globe to discover your next destination.
- **Self-Hosted Backend:** Entirely independent from third-party database providers like Supabase. Uses **SQLite** (`better-sqlite3`) for lightning-fast, local persistence.
- **Native Google Auth:** Seamless Google OAuth 2.0 login integration managed directly via your own server routes.

## Tech Stack
- **Frontend:** React, TailwindCSS, Framer Motion
- **Framework & Routing:** TanStack Start & TanStack Router
- **Backend & Database:** Node.js, `better-sqlite3`
- **AI Integration:** Google Gemini (`@ai-sdk/google`)
- **Auth:** Google OAuth 2.0 (`google-auth-library`), Cookie-based Sessions

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The SQLite database (`app.db`) will be automatically initialized on first run, along with all the necessary schemas for users, sessions, and trips.
