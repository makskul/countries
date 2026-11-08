# Country Review App

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your Supabase credentials
3. Run the migration SQL in your Supabase project SQL editor (see `supabase/migrations/001_reviews.sql`)
4. Install dependencies and start dev server:

```bash
npm install
npm run dev
```

## Supabase Setup

1. Create a new Supabase project
2. Run the SQL in `supabase/migrations/001_reviews.sql`
3. Copy your project URL and anon key into `.env`

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables: `SUPABASE_URL` and `SUPABASE_KEY`
