# TMA Engine OS - Testing Checklist

## 🎯 Purpose
This checklist helps verify that all functionality works correctly after the Base44 to Supabase migration when accessed through Bolt.

## ✅ Pre-Testing Setup

Before testing, ensure:
- [ ] All three migration files have been applied to Bolt's Supabase
- [ ] Service role key is configured in `.env` file
- [ ] Supabase Storage buckets created (`uploads`, `private_files`)
- [ ] Storage policies applied for file access
- [ ] Dev server is running without errors

## 🔐 Authentication & User Management

### Development User Login
- [ ] App loads without errors in browser console
- [ ] Dev user (dev@localhost.com) auto-creates on first load
- [ ] User profile is created in `users` table
- [ ] User is assigned 'admin' role automatically
- [ ] User session persists across page refreshes
- [ ] Logout functionality works (if implemented)

### User Profile
- [ ] User.me() successfully returns current user data
- [ ] User preferences can be saved and retrieved
- [ ] Membership level is correctly set
- [ ] Onboarding flags can be updated

**Verification:**
```javascript
// In browser console:
const { User } = await import('/src/api/entities.js');
const currentUser = await User.me();
console.log('Current user:', currentUser);
```

## 📊 Database Operations

### Entity CRUD Operations
Test each entity type:

#### Conversations Entity
- [ ] Create new conversation: `Conversation.create({ title, messages, is_pinned })`
- [ ] List conversations: `Conversation.list('-updated_date', 10)`
- [ ] Get single conversation: `Conversation.get(id)`
- [ ] Update conversation: `Conversation.update(id, { messages })`
- [ ] Delete conversation: `Conversation.delete(id)`
- [ ] Messages persist correctly in JSONB field
- [ ] Conversations ordered by newest first

#### AudioFile Entity
- [ ] Create audio file record
- [ ] List user's audio files
- [ ] Update analysis status
- [ ] Delete audio file
- [ ] Analysis results stored in JSONB

#### MixComparisons Entity
- [ ] Create mix comparison record
- [ ] List user's comparisons
- [ ] Update comparison status
- [ ] Comparison results stored correctly

#### ContentIdea Entity (ARK)
- [ ] Create content idea
- [ ] List user's content ideas
- [ ] Update content idea
- [ ] Script and hooks stored correctly

#### UserBrainDumpEntry Entity (ARK)
- [ ] Create brain dump entry
- [ ] List user's brain dumps
- [ ] Processing status updates
- [ ] Insights can be stored

**Verification Commands:**
```javascript
// In browser console:
const { Conversation } = await import('/src/api/entities.js');

// Test create
const conv = await Conversation.create({
  title: 'Test Conversation',
  messages: [{ role: 'user', content: 'Hello', timestamp: new Date().toISOString() }],
  is_pinned: false
});
console.log('Created:', conv);

// Test list
const convs = await Conversation.list('-updated_date', 5);
console.log('Conversations:', convs);
```

## 🏠 Dashboard Functionality

### Main Dashboard
- [ ] Dashboard loads without errors
- [ ] TMA OS logo displays and animates
- [ ] Welcome message shows user's name
- [ ] Three engine icons (KOE, ARK, INDI) display with glow effects
- [ ] Settings panel can be opened
- [ ] Dashboard accordion toggles properly
- [ ] Date/time widget updates every second
- [ ] Inspirational quote displays

### Dashboard Chat
- [ ] Chat interface loads
- [ ] Can type and send messages
- [ ] Messages persist in conversation
- [ ] Conversation history can be accessed
- [ ] New conversation can be created
- [ ] Conversation switching works
- [ ] Conversation deletion works
- [ ] Message count updates correctly
- [ ] Slash commands work (type `/` to test)
- [ ] AI assistants respond correctly

### Slash Commands
Test each command by typing in chat:
- [ ] `/intro` - Introduces the team
- [ ] `/analyse` - Activates analyze track tool
- [ ] `/compare` - Activates mix comparison tool
- [ ] `/vid` - Activates video analysis tool
- [ ] `/dump` - Brain dump analyzer
- [ ] `/hook` - Hook generation
- [ ] `/script` - Script generation
- [ ] `/chords` - Chord progression generator

### AI Assistant Responses
- [ ] MIKKI responds as orchestrator
- [ ] KOE responds with audio expertise
- [ ] ARK responds with content strategy
- [ ] INDI responds with brand guidance
- [ ] Response buttons work for each assistant

### Specialized Tools
- [ ] Analyze Track tool activates
- [ ] Mix Comparison tool shows file upload buttons
- [ ] Chord Generation tool accepts prompts
- [ ] Hooks Generation tool creates hooks
- [ ] Brain Dump tool processes thoughts
- [ ] Script Generator creates scripts
- [ ] Video Analysis tool shows upload interface

## 🎵 KOE Engine (Audio Production)

### KOE Main Page
- [ ] KOE page loads (route: `/KOE`)
- [ ] Welcome screen displays
- [ ] Personalization banner shows (if preferences incomplete)
- [ ] Can start new chat
- [ ] Can view sessions list
- [ ] Session switching works

### Audio Upload & Analysis
- [ ] Navigate to Upload page
- [ ] Drag and drop works for audio files
- [ ] File type validation works (MP3, WAV, FLAC, M4A, AAC)
- [ ] File size validation works (50MB limit)
- [ ] Analysis wizard displays with options
- [ ] Musical style selection works
- [ ] Master/Mix selection works
- [ ] Analysis starts after confirmation
- [ ] Progress indicator shows stages: uploading → analyzing → completed
- [ ] Analysis completes successfully
- [ ] Results stored in database
- [ ] Can navigate to analysis details

### Analyses List
- [ ] Analyses page shows all user's analyses
- [ ] Can filter by: All, Completed, Processing, Error
- [ ] Analysis cards display correctly
- [ ] Click on analysis opens detailed view
- [ ] Detailed analysis report renders properly
- [ ] Can navigate back to list

### Mix Comparison
- [ ] Can upload two audio files (A and B)
- [ ] File validation works for both files
- [ ] Comparison starts after both files uploaded
- [ ] Progress indicator shows comparison status
- [ ] Comparison results display correctly
- [ ] Can view side-by-side comparison
- [ ] Comparison stored in database

### KOE Chat Sessions
- [ ] Can create new KOE chat session
- [ ] Session persists across page loads
- [ ] Can link analysis to chat session
- [ ] Can link comparison to chat session
- [ ] Messages persist in session
- [ ] Can switch between sessions
- [ ] Session list shows recent sessions

## 🎬 ARK Engine (Content Creation)

### ARK Dashboard
- [ ] ARK Dashboard loads (route: `/ArkDashboard`)
- [ ] Creative Intelligence Dashboard displays
- [ ] Creative readiness widget shows
- [ ] Emotional intelligence widget displays
- [ ] Pattern recognition widget shows
- [ ] Smart recommendations display

### ARK Chat
- [ ] ARK Chat page loads (route: `/ArkChat`)
- [ ] Can start conversation
- [ ] ARK responds with content strategy
- [ ] Messages persist in conversation

### Brain Dump Analyzer
- [ ] Can input thoughts/ideas
- [ ] Brain dump is saved to database
- [ ] Analysis results display
- [ ] Creative readiness score shows
- [ ] Dominant themes identified
- [ ] Content opportunities suggested
- [ ] Emotional state analysis displays
- [ ] Brain dumps saved to library

### Content Ideas Vault
- [ ] Navigate to Content Ideas page (route: `/YourContentIdeas`)
- [ ] Can view saved content ideas
- [ ] Can create new content idea
- [ ] Scripts are stored correctly
- [ ] Hooks are displayed
- [ ] Can edit content ideas
- [ ] Can delete content ideas

### Shotlist Builder
- [ ] Shotlist Builder page loads (route: `/ArkShotlistBuilder`)
- [ ] Can create new shotlist
- [ ] Can add shots to shotlist
- [ ] Shot templates available
- [ ] Can reorder shots (drag and drop)
- [ ] Can edit shot details
- [ ] Shotlist saves correctly
- [ ] Can view saved shotlists (route: `/MyShotlists`)

### Hook Generator
- [ ] Activated via dashboard chat or ARK page
- [ ] Accepts content topic/idea
- [ ] Generates 5 viral hooks
- [ ] Hooks display in card format
- [ ] Can copy hooks
- [ ] Results can be saved

### Script Generator
- [ ] Activated via dashboard chat or ARK page
- [ ] Accepts video concept
- [ ] Generates full script structure
- [ ] Script sections display correctly
- [ ] Can export script
- [ ] Script saves to content ideas

### Video Analysis (MIKKI)
- [ ] Can upload video file (MP4, MOV, WEBM, MKV)
- [ ] File size limit enforced (200MB)
- [ ] Upload progress shows
- [ ] Video processes through stages
- [ ] Analysis generates successfully
- [ ] Performance metrics display
- [ ] Content strategy suggestions show
- [ ] Framing and pacing analysis displays

## 🎨 INDI Engine (Brand & Identity)

### INDI Main Page
- [ ] INDI page loads (route: `/INDI`)
- [ ] INDI interface displays
- [ ] Can interact with INDI chatbot
- [ ] Brand-related responses work

### Future INDI Features
- [ ] Brand identity tools (coming soon)
- [ ] Visual design tools (coming soon)
- [ ] Color palette tools (coming soon)

## 📁 File Upload & Storage

### Audio File Upload
- [ ] File upload to Supabase Storage works
- [ ] Files stored in `uploads` bucket
- [ ] File URLs generated correctly
- [ ] Files accessible via URL
- [ ] File size limits enforced

### Video File Upload
- [ ] Private file upload works
- [ ] Files stored in `private_files` bucket
- [ ] Signed URLs generated
- [ ] Signed URLs work for access
- [ ] Files expire correctly (if configured)

## 🔒 Security & RLS

### Row Level Security
- [ ] Users can only see their own data
- [ ] Cannot access other users' conversations
- [ ] Cannot access other users' audio files
- [ ] Cannot access other users' analyses
- [ ] Admin users can see all data (if tested with admin account)
- [ ] Service role bypasses RLS correctly

### Authentication Security
- [ ] Invalid tokens cleared automatically
- [ ] Session expiration handled gracefully
- [ ] Auth errors don't crash the app
- [ ] User data protected in database

## 🧭 Navigation & Routing

### Route Navigation
- [ ] All page routes work:
  - [ ] `/` → Dashboard
  - [ ] `/Dashboard` → Dashboard
  - [ ] `/Upload` → Upload Page
  - [ ] `/Analyses` → Analyses List
  - [ ] `/KOE` → KOE Engine
  - [ ] `/KoePreferences` → KOE Preferences
  - [ ] `/KoeSerenader` → KOE Serenader (if available)
  - [ ] `/INDI` → INDI Engine
  - [ ] `/MixCompare` → Mix Comparison
  - [ ] `/ArkChat` → ARK Chat
  - [ ] `/ArkDashboard` → ARK Dashboard
  - [ ] `/ArkOnboarding` → ARK Onboarding
  - [ ] `/ArkShotlistBuilder` → Shotlist Builder
  - [ ] `/YourContentIdeas` → Content Ideas
  - [ ] `/MyShotlists` → My Shotlists
  - [ ] `/YourBrainDumps` → Brain Dumps
  - [ ] `/ManageAssistants` → Assistants Management
  - [ ] `/GlobalAISettings` → AI Settings

### Engine Access
- [ ] All engines accessible based on membership level
- [ ] KOE accessible to basic+ users
- [ ] ARK accessible to pro+ users
- [ ] INDI accessible to premium users
- [ ] Disabled engines show locked state

### Back Navigation
- [ ] Can navigate back from detailed views
- [ ] Browser back button works correctly
- [ ] Navigation state preserved

## 🎨 UI/UX Components

### Visual Elements
- [ ] Logos display correctly (KOE, ARK, INDI, TMA)
- [ ] Icons render properly (Lucide icons)
- [ ] Glow effects on engine icons
- [ ] Gradient backgrounds display
- [ ] Modal dialogs work correctly
- [ ] Toast notifications appear

### Interactive Elements
- [ ] Buttons respond to clicks
- [ ] Hover states work
- [ ] Loading spinners show during operations
- [ ] Progress bars animate correctly
- [ ] Drag and drop works for files
- [ ] Form inputs accept text
- [ ] Dropdowns expand correctly

### Responsive Design
- [ ] Layout adapts to mobile screens
- [ ] Layout adapts to tablet screens
- [ ] Layout looks good on desktop
- [ ] All features accessible on mobile

## ⚡ Performance

### Load Times
- [ ] Initial page load is fast
- [ ] Route changes are smooth
- [ ] Data loads quickly from Supabase
- [ ] No unnecessary re-renders

### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Database errors handled gracefully
- [ ] File upload errors display correctly
- [ ] Auth errors don't crash app

## 🐛 Common Issues to Check

### Console Errors
- [ ] No "Table does not exist" errors
- [ ] No RLS policy violations
- [ ] No authentication errors
- [ ] No missing environment variable warnings

### Data Persistence
- [ ] Data survives page refresh
- [ ] Conversations don't disappear
- [ ] Analysis results persist
- [ ] User preferences saved

### Edge Cases
- [ ] Empty states display correctly
- [ ] Loading states show appropriately
- [ ] Error states render properly
- [ ] No data states handled

## 📊 Success Criteria

**All systems operational when:**
✅ All authentication tests pass
✅ All database CRUD operations work
✅ Dashboard chat fully functional
✅ KOE engine workflows complete
✅ ARK engine features work
✅ File uploads succeed
✅ RLS properly protects data
✅ No console errors or warnings
✅ All routes navigate correctly
✅ UI renders properly

## 🔄 After Testing

1. **Document Issues:**
   - Note any failing tests
   - Screenshot error messages
   - Check browser console logs

2. **Priority Fixes:**
   - Critical: Auth, database connection, RLS
   - High: Core features (chat, analysis)
   - Medium: UI polish, optional features
   - Low: Future enhancements

3. **Performance Notes:**
   - Record slow operations
   - Note optimization opportunities
   - Check database query efficiency

---

**Testing Tips:**
- Clear browser cache between major tests
- Test in incognito mode for fresh sessions
- Check both Chrome DevTools Console and Network tab
- Keep Supabase Dashboard open to verify database changes
- Test one feature at a time for easier debugging
