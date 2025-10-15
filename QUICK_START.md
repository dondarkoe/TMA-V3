# TMA Engine OS - Quick Start Guide for Bolt

## 🚀 Get Started in 5 Minutes

This guide will get your TMA Engine OS application running in Bolt with Supabase.

## Step 1: Apply Database Schema (2 minutes)

You need to run SQL commands in your Bolt Supabase instance:

### Option A: Through Bolt Interface
1. Look for "Database" or "Supabase" in your Bolt dashboard
2. Find the SQL Editor or Database Tools
3. Copy and paste each file's contents in order:
   - First: `supabase/migrations/001_initial_schema.sql`
   - Second: `supabase/migrations/002_rls_policies.sql`
   - Third: `supabase/migrations/003_add_conversations_messages.sql`
4. Execute each one (Click "Run" or "Execute")

### Option B: Direct Supabase Dashboard
If Bolt provides a direct link to Supabase:
1. Click "Open Supabase Dashboard"
2. Go to SQL Editor
3. Paste and execute each migration file

**What this does:** Creates all necessary database tables and security rules.

## Step 2: Get Your Service Role Key (1 minute)

1. In Bolt's Supabase settings, find:
   - Project Settings → API
   - Or look for "Service Role Key"
2. Copy the service role key
3. Open `.env` file in your project
4. Replace the placeholder on line 3:
   ```env
   VITE_SUPABASE_SERVICE_ROLE_KEY=paste_your_actual_key_here
   ```

**What this does:** Allows admin operations and user management to work.

## Step 3: Create Storage Buckets (2 minutes)

In your Supabase Dashboard:

1. **Go to Storage section**
2. **Create two buckets:**

   **Bucket 1: "uploads"**
   - Click "New Bucket"
   - Name: `uploads`
   - Public bucket: Yes (or configure policies)
   - File size limit: 50MB

   **Bucket 2: "private_files"**
   - Click "New Bucket"
   - Name: `private_files`
   - Public bucket: No
   - File size limit: 200MB

**What this does:** Enables file upload features for audio and video.

## Step 4: Test the Application

The dev server should already be running. Open your browser to the application:

### First Test: Dashboard
1. Dashboard should load without errors
2. You should see the TMA OS logo
3. Three engine buttons: KOE, ARK, INDI

### Second Test: Chat
1. Type a message in the chat box
2. Click Send or press Enter
3. MIKKI should respond
4. Message should persist after page refresh

### Third Test: Navigation
1. Click the KOE engine icon
2. KOE page should load
3. Click the ARK engine icon
4. ARK page should load

**✅ Success!** If all three tests pass, your app is working!

## 🎯 What to Try Next

### Try the Dashboard Chat
- Type `/intro` to meet the team
- Type a question like "How do I improve my mix?"
- Click the assistant buttons (MIKKI, KOE, ARK, INDI)

### Try KOE (Audio Production)
1. Click KOE engine icon
2. Click "Start Chat"
3. Ask audio production questions
4. Or navigate to Upload to analyze a track

### Try ARK (Content Creation)
1. Click ARK engine icon
2. Try the brain dump feature
3. Generate hooks for your content
4. Create a video script

## 🔧 Quick Troubleshooting

### App shows errors on load
**Fix:** Check browser console for specific error messages
- "Table does not exist" → Apply migration files
- "Not authenticated" → Clear cache and refresh
- "Service role key" error → Update service role key in .env

### Can't save conversations
**Fix:** Ensure migrations are applied and service role key is set

### File upload doesn't work
**Fix:** Create the storage buckets (uploads, private_files)

### Nothing happens when I type
**Fix:** Check console for errors, ensure Supabase is connected

## 📝 Development User

The app automatically creates a development user:
- **Email:** dev@localhost.com
- **Password:** dev123456
- **Role:** Admin (full access)

This user is created automatically on first load.

## 🎨 Features Overview

### Dashboard
- **Unified Chat:** Talk to all AI assistants
- **Slash Commands:** Quick access to tools (type `/`)
- **Conversation History:** All chats saved automatically
- **Specialized Tools:** 7 different tools for various tasks

### KOE Engine (Audio Production)
- **Audio Analysis:** Upload and analyze tracks
- **Mix Comparison:** Compare two versions side-by-side
- **Chord Generator:** AI-generated chord progressions
- **Production Chat:** Get mixing and mastering advice

### ARK Engine (Content Creation)
- **Brain Dump Analyzer:** Turn thoughts into content ideas
- **Hook Generator:** Create viral hooks
- **Script Writer:** Generate video scripts
- **Video Analysis:** Analyze video performance
- **Shotlist Builder:** Plan video shoots
- **Content Vault:** Store all your ideas

### INDI Engine (Brand & Identity)
- **Brand Guidance:** Get brand strategy advice
- **Visual Identity:** (Coming soon)
- **Design Tools:** (Coming soon)

## 💡 Pro Tips

1. **Use Slash Commands:** Type `/` in chat for quick tool access
2. **Save Everything:** All work is automatically saved
3. **Link Context:** KOE can reference your uploaded tracks
4. **Organize:** Pin important conversations
5. **Explore:** Each engine has unique specialized tools

## 📚 Learn More

- **Full Setup Guide:** See `BOLT_SUPABASE_SETUP.md`
- **Testing Checklist:** See `TESTING_CHECKLIST.md`
- **Migration Guide:** See `MIGRATION_GUIDE.md` for technical details

## 🆘 Need Help?

### Check These First:
1. Browser console (F12 → Console tab)
2. Supabase Dashboard for data
3. Migration files are all applied
4. Service role key is configured
5. Storage buckets created

### Common Solutions:
- **Clear cache:** Ctrl+Shift+Del → Clear browsing data
- **Restart dev server:** Stop and start again
- **Check .env:** Ensure all values are correct
- **Verify migrations:** All three SQL files executed

---

**🎉 You're Ready!** Your TMA Engine OS is now fully operational. Start creating, analyzing, and building with AI-powered assistance across music production, content creation, and brand development.

**Have fun exploring your new creative AI workspace!** 🚀
