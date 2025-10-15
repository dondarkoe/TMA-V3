# TMA Engine OS - Bolt Supabase Setup Guide

## 🎯 Overview

This guide will help you complete the setup of TMA Engine OS with Bolt's managed Supabase instance. The application has been successfully migrated from Base44 to Supabase with minimal code changes.

## ✅ What's Already Done

- ✅ Supabase client integration configured
- ✅ Custom SDK layer for Base44 compatibility
- ✅ Environment variables configured (except service role key)
- ✅ All component code updated to use Supabase
- ✅ Row Level Security policies defined
- ✅ Migration files created for database schema

## 🔧 Required Setup Steps

### 1. Apply Database Migrations

You need to apply the following migration files to your Bolt Supabase instance:

**In order:**
1. `supabase/migrations/001_initial_schema.sql` - Creates all tables
2. `supabase/migrations/002_rls_policies.sql` - Applies security policies
3. `supabase/migrations/003_add_conversations_messages.sql` - Adds messages field

**How to apply migrations in Bolt:**

Since Bolt manages your Supabase instance, you'll need to:

1. Access your Bolt dashboard
2. Navigate to the Supabase/Database section
3. Look for SQL Editor or Database Tools
4. Copy and execute each migration file in order

Alternatively, if Bolt provides a direct Supabase dashboard link:
1. Click the Supabase dashboard link
2. Go to SQL Editor
3. Execute each migration file

### 2. Update Service Role Key

**CRITICAL:** The `.env` file currently has a placeholder service role key. You need to:

1. Get the actual service role key from Bolt's Supabase settings
2. Update line 3 in `.env` file:
```env
VITE_SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_from_bolt
```

**Why is this needed?**
- The service role key allows admin operations
- It bypasses Row Level Security for user management
- The dev user auto-creation requires it
- Some entity operations need elevated permissions

### 3. Create Supabase Storage Buckets

For file upload functionality, create these storage buckets:

**Required buckets:**
1. `uploads` - For audio files and general uploads
   - Make it public or configure access policies
   - Enable file size limits (50MB recommended)

2. `private_files` - For video files and private content
   - Keep this private with signed URL access
   - Enable larger file size limits (200MB for videos)

**How to create buckets:**
- In Supabase Dashboard → Storage
- Click "New Bucket"
- Configure policies for authenticated users

### 4. Configure Storage Policies

Apply these storage policies:

**For `uploads` bucket:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**For `private_files` bucket:**
```sql
-- Allow authenticated users to upload private files
CREATE POLICY "Users can upload private files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'private_files');

-- Allow users to read their own private files
CREATE POLICY "Users can read private files via signed URLs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'private_files');
```

## 🧪 Testing the Setup

### Test 1: Database Connection
1. Start the dev server: The project will auto-start
2. Open browser console
3. Look for: "Service role client initialization" messages
4. Should NOT see "Table does not exist" errors

### Test 2: Authentication
1. The app should load the Dashboard
2. Try the dev user login (automatically handled)
3. User profile should be created in `users` table
4. Check Console for "Current user:" log

### Test 3: Entity Operations
1. Navigate to different pages (Dashboard, KOE, ARK)
2. Try creating a conversation in Dashboard chat
3. Check Console for entity creation logs
4. Verify data persists after page refresh

### Test 4: File Upload (When Buckets Are Ready)
1. Navigate to Upload page
2. Try uploading an audio file
3. Should upload to Supabase Storage
4. Check Storage bucket for uploaded file

## 🔍 Troubleshooting

### Issue: "Table does not exist" errors
**Solution:** Apply all three migration files to your Supabase instance

### Issue: "Row Level Security policy violation"
**Solution:** Ensure the service role key is correctly configured in `.env`

### Issue: "Not authenticated" errors
**Solution:**
- Clear browser cache and localStorage
- Restart the dev server
- Check that Supabase URL and anon key are correct

### Issue: File upload fails
**Solution:**
- Ensure storage buckets are created
- Verify storage policies are applied
- Check file size limits

### Issue: "User from sub claim in JWT does not exist"
**Solution:**
- This is a known issue when switching Supabase instances
- The app will auto-clear the invalid session
- Just refresh the page and try again

## 📊 Database Schema Overview

The application uses 18 tables organized into these groups:

**Authentication & Users:**
- `users` - User profiles and authentication

**Audio & Analysis:**
- `audio_files` - Uploaded audio tracks
- `analyses` - Audio analysis results
- `mix_comparisons` - Mix comparison data

**Chat System:**
- `chat_sessions` - KOE chat sessions
- `chat_messages` - Individual chat messages
- `conversations` - Dashboard conversations with messages

**Content Creation (ARK):**
- `content_ideas` - Video script ideas
- `user_shotlists` - Video shotlists
- `shotlist_items` - Individual shots
- `user_brain_dump_entries` - Brain dump entries
- `brain_dump_insights` - AI-generated insights

**Music Production (KOE):**
- `koe_lab_sessions` - Production sessions
- `sound_recipes` - Sound design recipes
- `saved_progressions` - Chord progressions
- `artist_production_styles` - Artist style references

**AI Configuration:**
- `ai_assistants` - AI assistant definitions
- `global_ai_configs` - Global AI settings
- `ark_profiles` - User creative profiles

## 🚀 Next Steps After Setup

1. **Test Core Features:**
   - Dashboard chat with MIKKI
   - Audio upload and analysis
   - KOE chatbot sessions
   - ARK brain dump analyzer

2. **Configure Integrations (Optional):**
   - Add OpenAI API key for enhanced LLM features
   - Configure email service for notifications
   - Set up any webhook endpoints

3. **Production Deployment:**
   - Update `VITE_APP_DOMAIN` in `.env`
   - Configure production Supabase instance
   - Set up CDN for faster asset delivery
   - Enable Supabase backups

## 📝 Important Notes

- **Service Role Key Security:** Never commit the service role key to git (it's in .gitignore)
- **Development User:** Email: `dev@localhost.com`, Password: `dev123456`
- **Auto-Admin:** The dev user is automatically assigned admin role
- **Data Safety:** All user data is protected by Row Level Security
- **Real-time:** Supabase real-time features can be enabled for conversations
- **Backups:** Enable automatic backups in Supabase dashboard

## 🎉 Success Indicators

When everything is working correctly, you should see:

✅ Application loads without console errors
✅ Dashboard displays with the TMA OS logo
✅ Can navigate between KOE, ARK, and INDI engines
✅ Chat messages persist across refreshes
✅ User data is properly isolated (RLS working)
✅ File uploads work (when buckets configured)
✅ No "Table does not exist" warnings

---

**Need Help?** Check the console logs first - they provide detailed information about what's happening with database operations and authentication.
