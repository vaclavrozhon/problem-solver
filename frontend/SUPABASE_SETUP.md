# Supabase Authentication Setup

This frontend now requires Supabase authentication. Follow these steps to set it up:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon (public) key

## 3. Configure Environment Variables

Create a `.env.local` file in the frontend directory with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key
VITE_API_BASE=http://localhost:8000
```

## 4. Configure Authentication Providers

In your Supabase dashboard:

1. Go to Authentication > Providers
2. Enable the providers you want (Google, GitHub, Email, etc.)
3. Configure OAuth settings for each provider if needed

## 5. Set Up Redirect URLs

In Authentication > URL Configuration, add:
- Site URL: `http://localhost:3000` (for development)
- Redirect URLs: `http://localhost:3000`

## 6. Start the Application

```bash
npm run dev
```

The application will now require authentication to access any page. Users will see a login screen if they're not authenticated.
