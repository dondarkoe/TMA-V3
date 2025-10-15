# TMA-Engine OS Migration Guide: Base44 to Supabase

This guide will help you migrate the TMA-Engine OS application from Base44 to a self-hosted Supabase infrastructure using the universal Base44-to-Supabase SDK.

## Overview

The migration involves:
1. Installing required dependencies
2. Setting up a Supabase project
3. Replacing the Base44 SDK with the universal custom SDK
4. Creating the database schema
5. Configuring environment variables
6. Testing the migration

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient for development)
- Git repository access

## Step 1: Install Dependencies

The required dependencies have already been installed:
```bash
npm install @supabase/supabase-js
```

## Step 2: Set Up Supabase Project

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign in with GitHub or create an account
   - Create a new project (choose a region close to your users)

2. **Get Your Credentials**
   - In your Supabase project dashboard, go to Settings > API
   - Copy the Project URL, Anon Key, and Service Role Key

3. **Install Supabase CLI (Optional for local development)**
   ```bash
   npm install -g @supabase/cli
   supabase init
   ```

## Step 3: Apply Database Schema

The migration files have been created in the `supabase/migrations/` directory:

1. **Option A: Using Supabase Dashboard**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the query
   - Then copy and paste the contents of `supabase/migrations/002_rls_policies.sql`
   - Execute the query

2. **Option B: Using Supabase CLI**
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   supabase db reset
   ```

## Step 4: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update your `.env` file with your Supabase credentials:**
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   VITE_APP_NAME=TMA Engine OS
   VITE_APP_DOMAIN=https://your-domain.com
   ```

## Step 5: SDK Integration

The migration SDK has already been integrated:

- `src/lib/supabase-client.js` - Supabase connection setup
- `src/lib/custom-sdk.js` - Universal custom SDK implementation  
- `src/api/base44Client.js` - Updated to use the custom SDK

The SDK automatically discovers and creates entities based on your existing Base44 code, so **no code changes are required** in your components.

## Step 6: Test the Migration

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test authentication:**
   - Try logging in with the development user (dev@localhost.com / dev123456)
   - The system will automatically create the user if it doesn't exist

3. **Test core functionality:**
   - Navigate through the three engines (KOE, ARK, INDI)
   - Test creating and managing chat sessions
   - Verify data persistence

## Step 7: Implement Integration Functions (Optional)

The SDK provides placeholder implementations for Base44 integrations. To make them fully functional:

### LLM Integration (InvokeLLM)
Replace the placeholder in `src/lib/custom-sdk.js` with OpenAI API calls:

```javascript
// Example implementation
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

// In the InvokeLLM function:
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  response_format: response_json_schema ? { type: "json_object" } : undefined
});
```

### Email Integration (SendEmail)
Replace with Resend or SendGrid:

```javascript
// Example with Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

// In the SendEmail function:
const result = await resend.emails.send({
  from: `${from_name} <noreply@yourdomain.com>`,
  to: [to],
  subject: subject,
  html: body
});
```

### File Upload Integration (UploadFile)
Replace with Supabase Storage:

```javascript
// In the UploadFile function:
const fileName = `${Date.now()}_${file.name}`;
const { data, error } = await supabase.storage
  .from('uploads')
  .upload(fileName, file);

if (error) throw error;

const { data: { publicUrl } } = supabase.storage
  .from('uploads')
  .getPublicUrl(fileName);

return { file_url: publicUrl };
```

## Step 8: Deploy Your Migrated App

### Option 1: Vercel
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
```bash
npm run build
# Deploy the dist folder to Netlify
```

### Option 3: Self-hosted with Docker
```bash
docker build -t tma-engine-os .
docker run -p 3000:3000 --env-file .env tma-engine-os
```

## Migration Benefits

| Feature | Base44 | Self-Hosted with Supabase |
|---------|--------|---------------------------|
| Monthly Cost | $X/month | $0-25/month |
| Data Control | Limited | **Full** |
| Customization | Limited | **Unlimited** |
| Vendor Lock-in | Yes | **No** |
| Real-time Features | Limited | **Full** |
| Performance | Fixed | **Optimizable** |

## Troubleshooting

### Common Issues

**"Table does not exist" errors**
- Ensure you've applied both migration files to your Supabase database
- Check that table names match between the schema and your entity usage

**"Row Level Security policy violation"**
- Verify your RLS policies are correctly applied
- Check that users have proper authentication tokens

**"Not authenticated" errors**
- Ensure your Supabase URL and keys are correctly set in `.env`
- Try clearing browser cache and logging in again

**Development user not working**
- The development user (dev@localhost.com / dev123456) is created automatically on first login
- Check browser console for any authentication errors

### Getting Help

1. Check the [Base44 to Supabase SDK documentation](https://github.com/Ai-Automators/base44-to-supabase-sdk)
2. Review the [Supabase documentation](https://supabase.com/docs)
3. Check the browser console for detailed error messages

## Post-Migration Checklist

- [ ] All three engines (KOE, ARK, INDI) load correctly
- [ ] User authentication works properly
- [ ] Data persistence is functioning
- [ ] Chat sessions can be created and managed
- [ ] Audio file uploads work (if tested)
- [ ] All existing Base44 functionality works unchanged
- [ ] Environment variables are properly configured for production
- [ ] Backups are configured in Supabase

## Next Steps

1. **Monitor Performance**: Use Supabase's built-in monitoring to track performance
2. **Set Up Backups**: Configure automated backups in Supabase settings
3. **Implement Integrations**: Replace placeholder functions with actual service integrations
4. **Optimize Queries**: Add database indexes based on your usage patterns
5. **Scale as Needed**: Upgrade to Supabase Pro tier when you exceed free limits

---

**Congratulations!** You've successfully migrated TMA-Engine OS from Base44 to a self-hosted Supabase infrastructure with zero code changes required for core functionality.