# Supabase Authentication Setup Guide

## Overview

The zumbaton-web application now uses Supabase for authentication. This guide will help you complete the setup.

## Prerequisites

- Supabase project created
- Environment variables configured (already done in `.env.local`)

## Steps Completed

1. ✅ Created `.env.local` with Supabase credentials
2. ✅ Updated `AuthContext` to use Supabase directly
3. ✅ Implemented user profile fetching from database

## Next Steps

### 1. Run Database Schema

You need to run the database schema in your Supabase project. The schema file is located at:

```
zumbaton-admin/supabase/schema.sql
```

**To apply the schema:**

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy the contents of `zumbaton-admin/supabase/schema.sql`
6. Paste into the SQL Editor
7. Click **Run** to execute the schema

**Important:** This creates:
- `user_profiles` table
- Database trigger to auto-create profiles on user signup
- Row-Level Security (RLS) policies
- Helper functions for RBAC

### 2. Configure Email Settings (Optional)

By default, Supabase may require email confirmation. To disable this for development:

1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Under **Email Auth**, toggle **Enable email confirmations** OFF
3. Save changes

**For production:** Keep email confirmations enabled for security.

### 3. Test the Authentication Flow

1. Start the development server:
   ```bash
   cd zumbaton-web
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signup`
3. Create a new account
4. Try signing in at `http://localhost:3000/signin`

### 4. Verify User Profile Creation

After signing up, check that the user profile was created:

1. Go to Supabase dashboard → **Table Editor**
2. Select `user_profiles` table
3. Verify your new user appears with the correct email and role

The database trigger should automatically create the profile when a user signs up.

## How Authentication Works

### Sign Up Flow

1. User submits signup form with name, email, password
2. `AuthContext.signUp()` calls `supabase.auth.signUp()`
3. Supabase creates user in `auth.users` table
4. Database trigger creates profile in `user_profiles` table
5. If email confirmation is disabled, user is immediately signed in
6. User profile is fetched and stored in context

### Sign In Flow

1. User submits signin form with email and password
2. `AuthContext.signIn()` calls `supabase.auth.signInWithPassword()`
3. Supabase validates credentials
4. User profile is fetched from `user_profiles` table
5. User is authenticated and redirected to dashboard

### Session Management

- Sessions are automatically managed by Supabase
- Tokens are stored securely in browser
- Auth state changes are listened to via `onAuthStateChange`
- Session persists across page refreshes

## Troubleshooting

### Issue: "User profile not found" after signup

**Solution:** Make sure the database trigger is created. Check the schema.sql file and verify the trigger exists:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Issue: "Failed to create account" error

**Possible causes:**
- Email already exists
- Password doesn't meet requirements (min 8 characters)
- Database trigger failed

**Check:**
- Supabase dashboard → Authentication → Users (see if user was created)
- Supabase dashboard → Logs (check for errors)

### Issue: Email confirmation required

If you see a message about email confirmation:
- Check your email inbox for confirmation link
- Or disable email confirmation in Supabase settings (development only)

## Security Notes

- **RLS is enabled** on all tables - users can only access their own data
- **Password validation** is enforced by Supabase (min 8 characters)
- **Session tokens** are automatically refreshed
- **Email confirmation** should be enabled in production

## Environment Variables

Your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ejeihiyxuzlqamlgudnr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Never commit this file to git!** It's already in `.gitignore`.

## Next Development Steps

1. ✅ Authentication is now working
2. 🔄 Implement protected routes (dashboard requires auth)
3. 🔄 Add password reset functionality
4. 🔄 Add social auth (Google, GitHub) if needed
5. 🔄 Implement user profile editing

## Support

If you encounter issues:
1. Check Supabase dashboard logs
2. Check browser console for errors
3. Verify database schema is applied correctly
4. Ensure environment variables are set

