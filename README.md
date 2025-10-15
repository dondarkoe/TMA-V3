# TMA Engine OS

**The Musician's Architect Operating System** - An AI-powered creative workspace for music producers, content creators, and artists.

## 🎯 What is TMA Engine OS?

TMA Engine OS is a comprehensive creative platform featuring three specialized AI engines:

- **🎵 KOE Engine** - Audio production, mixing, and mastering assistant
- **🎬 ARK Engine** - Content creation and strategy planning
- **🎨 INDI Engine** - Brand identity and visual design (coming soon)

## 🚀 Quick Start

**New to TMA Engine OS?** Start here: **[QUICK_START.md](QUICK_START.md)** - Get running in 5 minutes!

### Step 1: Database Setup
Apply the migration files to your Bolt Supabase instance (see [QUICK_START.md](QUICK_START.md))

### Step 2: Configure Environment
Update the service role key in `.env` file

### Step 3: Create Storage Buckets
Create `uploads` and `private_files` buckets in Supabase

### Step 4: Start Using!
The dev server should already be running. Open your browser and start creating!

## 📚 Documentation

We've created comprehensive guides to help you:

### For Getting Started
- **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide
- **[BOLT_SUPABASE_SETUP.md](BOLT_SUPABASE_SETUP.md)** - Complete setup instructions for Bolt
- **[README_MIGRATION.md](README_MIGRATION.md)** - Migration overview and benefits

### For Testing & Verification
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - 200+ test cases covering all features
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was done and why

### For Developers
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Technical migration details
- **Database Schema:** `supabase/migrations/` - All table definitions

## 🛠️ Technology Stack

- **Frontend:** React 18 + Vite
- **UI Library:** Shadcn/ui + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Routing:** React Router v7
- **State Management:** React Hooks
- **AI Integration:** OpenAI, Claude, Gemini

## ✨ Key Features

### Dashboard
- Unified chat interface with all AI assistants
- Slash command system (`/intro`, `/analyse`, `/vid`, etc.)
- Conversation history and management
- 7 specialized tools accessible via chat

### KOE Engine (Audio Production)
- Audio file analysis with detailed metrics
- Mix comparison tool
- AI-powered chord progression generator
- Production advice chatbot
- Session-based conversations

### ARK Engine (Content Creation)
- Brain dump analyzer for ideation
- Viral hook generator (5 hooks per request)
- Video script generator
- Video performance analysis
- Shotlist builder for video planning
- Content ideas vault

### INDI Engine (Brand & Identity)
- Brand strategy chatbot
- Visual identity tools (coming soon)
- Design system builder (coming soon)

## 🏗️ Project Structure

```
tma-engine-os/
├── src/
│   ├── api/
│   │   ├── base44Client.js      # API client
│   │   ├── entities.js          # Entity exports
│   │   ├── functions.js         # Function exports
│   │   └── integrations.js      # Integration exports
│   ├── components/
│   │   ├── chat/                # Chat components
│   │   ├── analyses/            # Analysis visualization
│   │   ├── ark/                 # ARK-specific components
│   │   ├── koe/                 # KOE-specific components
│   │   └── ui/                  # Shared UI components
│   ├── lib/
│   │   ├── supabase-client.js   # Supabase connection
│   │   ├── custom-sdk.js        # Custom SDK layer
│   │   └── utils.js             # Utility functions
│   ├── pages/                   # Route pages (17 pages)
│   └── main.jsx                 # Application entry
├── supabase/
│   └── migrations/              # Database migrations
├── public/                      # Static assets
├── docs/                        # Additional documentation
└── Configuration files

```

## 🎮 Using the Application

### Development User
The app creates a default development user:
- **Email:** dev@localhost.com
- **Password:** dev123456
- **Role:** Admin (full access to all features)

### Navigation
- **Dashboard** - Main interface with unified chat
- **KOE** - Audio production tools
- **ARK** - Content creation tools
- **INDI** - Brand identity tools
- **Upload** - File upload and analysis
- **Analyses** - View all audio analyses

### Slash Commands
Type these in the Dashboard chat for quick access:
- `/intro` - Meet the AI team
- `/analyse` - Analyze audio track
- `/compare` - Compare two mixes
- `/vid` - Analyze video
- `/dump` - Brain dump analyzer
- `/hook` - Generate viral hooks
- `/script` - Create video script
- `/chords` - Generate chord progression

## 🔒 Security

- **Row Level Security (RLS):** All user data protected
- **Authentication:** Supabase Auth with JWT tokens
- **Service Role:** Admin operations use elevated permissions
- **Data Isolation:** Users can only access their own data
- **Secure Storage:** Private files with signed URLs

## 🧪 Testing

Run the comprehensive test checklist:
```bash
# See TESTING_CHECKLIST.md for detailed test cases
```

**200+ test cases covering:**
- Authentication flows
- Database operations
- All three engines
- File uploads
- Security policies
- UI components
- Navigation

## 📊 Database Schema

18 tables organized into:
- **Authentication:** users
- **Audio:** audio_files, analyses, mix_comparisons
- **Chat:** chat_sessions, chat_messages, conversations
- **Content:** content_ideas, user_shotlists, shotlist_items, brain_dump_entries
- **Production:** koe_lab_sessions, sound_recipes, saved_progressions, artist_production_styles
- **AI:** ai_assistants, global_ai_configs, ark_profiles

See [BOLT_SUPABASE_SETUP.md](BOLT_SUPABASE_SETUP.md) for detailed schema information.

## 🚢 Deployment

### Current Setup
The application runs in Bolt with a managed Supabase instance.

### Production Deployment
1. Update `VITE_APP_DOMAIN` in `.env`
2. Configure production Supabase instance
3. Set up CDN for assets
4. Enable Supabase backups
5. Configure monitoring

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed deployment instructions.

## 🐛 Troubleshooting

### Common Issues

**"Table does not exist" errors**
- Solution: Apply all migration files in order (001, 002, 003)

**"Row Level Security policy violation"**
- Solution: Configure service role key in `.env`

**File upload doesn't work**
- Solution: Create storage buckets in Supabase dashboard

**App won't load**
- Solution: Check browser console for specific errors

See [BOLT_SUPABASE_SETUP.md](BOLT_SUPABASE_SETUP.md) for more troubleshooting tips.

## 🔄 Migration from Base44

This application has been successfully migrated from Base44 to Supabase with:
- ✅ Zero code changes required in components
- ✅ Custom SDK layer for Base44 compatibility
- ✅ Complete database schema migration
- ✅ Row Level Security implementation
- ✅ All features maintained

See [README_MIGRATION.md](README_MIGRATION.md) for migration details.

## 🛣️ Roadmap

### Current Features (v1.0)
- ✅ Dashboard with unified chat
- ✅ KOE Engine (audio production)
- ✅ ARK Engine (content creation)
- ✅ File upload and analysis
- ✅ Conversation history
- ✅ 7 specialized tools

### Coming Soon
- 🔜 INDI Engine full features
- 🔜 Real-time collaboration
- 🔜 Mobile responsive optimization
- 🔜 Advanced analytics dashboard
- 🔜 Team collaboration features
- 🔜 Integration marketplace

## 📞 Support

### Resources
- **Setup Issues:** Check [BOLT_SUPABASE_SETUP.md](BOLT_SUPABASE_SETUP.md)
- **Testing Help:** See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
- **Quick Questions:** Refer to [QUICK_START.md](QUICK_START.md)
- **Technical Details:** Review [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)

### Debugging Tips
1. Open browser console (F12 → Console)
2. Check Supabase Dashboard → Table Editor
3. Verify environment variables in `.env`
4. Review migration files are all applied
5. Test with development user first

## 🙏 Credits

Built with:
- React & Vite
- Supabase
- Shadcn/ui
- Tailwind CSS
- OpenAI, Anthropic Claude, Google Gemini
- And many other open-source technologies

---

## 📄 License

Proprietary - TMA Engine OS

---

**Ready to get started?** Head over to [QUICK_START.md](QUICK_START.md) and get your TMA Engine OS running in 5 minutes! 🚀
