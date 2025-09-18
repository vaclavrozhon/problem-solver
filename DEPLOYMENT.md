# Deployment Guide

## Environment Variables

### Required for Railway Deployment

Set these environment variables in your Railway dashboard:

```bash
# Database (Auto-set by Railway when you add PostgreSQL service)
DATABASE_URL=postgresql://username:password@host:port/database

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_key_here

# JWT Secret (Generate a random string)
JWT_SECRET_KEY=your_random_jwt_secret_here

# OpenAI API (Global key for all users)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Application Settings
AR_DATA_ROOT=/app/data
```

### Optional Configuration

```bash
# Port (Auto-set by Railway)
PORT=8000

# Railway Environment Detection (Auto-set by Railway)
RAILWAY_ENVIRONMENT=production
```

## Google OAuth Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

### 2. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "Automatic Researcher"

### 3. Configure URLs

**For Railway Production:**
```
Authorized JavaScript origins:
https://your-app-name.up.railway.app

Authorized redirect URIs:
https://your-app-name.up.railway.app/auth/google/callback
```

**For Local Development:**
```
Authorized JavaScript origins:
http://localhost:5173
http://localhost:8000

Authorized redirect URIs:
http://localhost:8000/auth/google/callback
```

### 4. Get Credentials

Google will provide:
- **Client ID**: Used in frontend (safe to expose)
- **Client Secret**: Used in backend (keep secret)

## Railway Deployment Steps

### 1. Add PostgreSQL Database

1. In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"
2. Railway automatically sets `DATABASE_URL` environment variable

### 2. Set Environment Variables

In Railway dashboard → Variables tab, add:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
JWT_SECRET_KEY=your_random_secret_here
OPENAI_API_KEY=your_openai_key_here
AR_DATA_ROOT=/app/data
```

### 3. Deploy

1. Connect your GitHub repository
2. Railway auto-detects configuration and deploys
3. Your app will be available at `https://your-app-name.up.railway.app`

## Local Development Setup

### 1. Environment File

Create `.env` file in project root:
```bash
DATABASE_URL=sqlite:///./data/app.db
GOOGLE_CLIENT_ID=your_development_client_id
GOOGLE_CLIENT_SECRET=your_development_client_secret
JWT_SECRET_KEY=your_local_secret
OPENAI_API_KEY=your_openai_key
AR_DATA_ROOT=./data
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
cd frontend && npm install
```

### 3. Run Development Server

```bash
python3 run.py
```

## Database Schema

The application automatically creates these tables on startup:

- **users**: User accounts from Google OAuth
- **problems**: Research problems created by users
- **research_rounds**: AI-generated research rounds
- **problem_files**: Files associated with problems
- **drafts**: Paper drafts for writing
- **writing_rounds**: Paper writing iterations
- **credit_transactions**: User credit usage tracking
- **run_sessions**: Active research sessions
- **system_config**: System configuration

## Credit System

- Users start with $10.00 in credits
- Credits are deducted based on OpenAI API usage
- Administrators can add credits via database or admin endpoints
- All usage is tracked in credit_transactions table

## Security Notes

- JWT tokens expire after 7 days
- Google OAuth handles user authentication
- Database passwords and API keys are stored securely
- CORS is configured for cross-origin requests
- All user data is isolated by user_id

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check Railway PostgreSQL service is running
- Ensure database tables are created (check startup logs)

### Google OAuth Issues
- Verify client ID and secret are correct
- Check authorized redirect URIs match your domain
- Ensure Google+ API is enabled

### Credit/API Issues
- Verify `OPENAI_API_KEY` is valid
- Check user has sufficient credits
- Monitor credit_transactions for usage tracking