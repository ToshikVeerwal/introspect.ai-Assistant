# Lumora AI

Lumora AI is a premium reflective journaling and life insights companion designed for modern, thoughtful users. It combines voice journaling, mood analytics, memory search, weekly reflections, goals, and a life-coach style experience in a dark, futuristic interface.

## Features
- AI-powered voice journaling with multilingual support
- Rich text journal editor with tags, images, attachments, and autosave
- Mood detection with explanations and confidence levels
- Emotional timeline and analytics dashboard
- Weekly reflections and monthly insights
- Goal tracking and smart notifications
- Premium UI inspired by Apple, Notion, Arc, and ChatGPT

## Run locally
1. Install dependencies
   ```bash
   npm install
   ```
2. Start the development server
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000

## Environment variables
Create a .env.local file with:
```bash
NEXT_PUBLIC_APP_NAME=Lumora AI
```

## Architecture
- Next.js App Router for frontend and API routes
- TypeScript for all application code
- Tailwind CSS for styling
- Recharts for analytics visualizations
- Framer Motion for subtle motion

## Deployment
Deploy to Vercel with the standard Next.js workflow.
