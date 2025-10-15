/**
 * TMA Engine OS - Setup Verification Script
 *
 * This script helps verify that your Supabase setup is correct.
 * Run this in the browser console after the app loads.
 */

console.log('🔍 TMA Engine OS - Setup Verification Starting...\n');

async function verifySetup() {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // Check 1: Environment Variables
  console.log('1️⃣ Checking environment variables...');
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
      results.failed.push('VITE_SUPABASE_URL not configured');
    } else {
      results.passed.push('VITE_SUPABASE_URL configured');
    }

    if (!anonKey || anonKey.length < 100) {
      results.failed.push('VITE_SUPABASE_ANON_KEY invalid');
    } else {
      results.passed.push('VITE_SUPABASE_ANON_KEY configured');
    }

    if (!serviceRoleKey || serviceRoleKey.includes('placeholder')) {
      results.warnings.push('VITE_SUPABASE_SERVICE_ROLE_KEY needs real key');
    } else {
      results.passed.push('VITE_SUPABASE_SERVICE_ROLE_KEY configured');
    }
  } catch (error) {
    results.failed.push(`Environment check failed: ${error.message}`);
  }

  // Check 2: Supabase Connection
  console.log('2️⃣ Testing Supabase connection...');
  try {
    const { supabaseClient } = await import('/src/lib/supabase-client.js');
    if (supabaseClient) {
      results.passed.push('Supabase client initialized');
    }
  } catch (error) {
    results.failed.push(`Supabase client error: ${error.message}`);
  }

  // Check 3: User Entity
  console.log('3️⃣ Testing User entity...');
  try {
    const { User } = await import('/src/api/entities.js');
    const currentUser = await User.me();
    if (currentUser) {
      results.passed.push(`User entity works (${currentUser.email})`);
    }
  } catch (error) {
    results.failed.push(`User entity error: ${error.message}`);
  }

  // Check 4: Conversation Entity
  console.log('4️⃣ Testing Conversation entity...');
  try {
    const { Conversation } = await import('/src/api/entities.js');
    const conversations = await Conversation.list('-updated_date', 5);
    results.passed.push(`Conversation entity works (${conversations.length} found)`);
  } catch (error) {
    if (error.message.includes('does not exist')) {
      results.failed.push('Conversations table missing - apply migrations');
    } else if (error.message.includes('policy')) {
      results.failed.push('RLS policy issue - check service role key');
    } else {
      results.failed.push(`Conversation entity error: ${error.message}`);
    }
  }

  // Check 5: AudioFile Entity
  console.log('5️⃣ Testing AudioFile entity...');
  try {
    const { AudioFile } = await import('/src/api/entities.js');
    const audioFiles = await AudioFile.list('-created_date', 5);
    results.passed.push(`AudioFile entity works (${audioFiles.length} found)`);
  } catch (error) {
    if (error.message.includes('does not exist')) {
      results.failed.push('Audio_files table missing - apply migrations');
    } else {
      results.warnings.push(`AudioFile entity: ${error.message}`);
    }
  }

  // Check 6: AIAssistant Entity
  console.log('6️⃣ Testing AIAssistant entity...');
  try {
    const { AIAssistant } = await import('/src/api/entities.js');
    const assistants = await AIAssistant.list();
    results.passed.push(`AIAssistant entity works (${assistants.length} found)`);
  } catch (error) {
    results.warnings.push(`AIAssistant entity: ${error.message}`);
  }

  // Check 7: GlobalAIConfig Entity
  console.log('7️⃣ Testing GlobalAIConfig entity...');
  try {
    const { GlobalAIConfig } = await import('/src/api/entities.js');
    const configs = await GlobalAIConfig.list();
    results.passed.push(`GlobalAIConfig entity works (${configs.length} found)`);
  } catch (error) {
    results.warnings.push(`GlobalAIConfig entity: ${error.message}`);
  }

  // Print Results
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION RESULTS');
  console.log('='.repeat(60) + '\n');

  if (results.passed.length > 0) {
    console.log('✅ PASSED (' + results.passed.length + ')');
    results.passed.forEach(msg => console.log('  ✓', msg));
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS (' + results.warnings.length + ')');
    results.warnings.forEach(msg => console.log('  ⚠', msg));
    console.log('');
  }

  if (results.failed.length > 0) {
    console.log('❌ FAILED (' + results.failed.length + ')');
    results.failed.forEach(msg => console.log('  ✗', msg));
    console.log('');
  }

  // Overall Status
  console.log('='.repeat(60));
  if (results.failed.length === 0) {
    console.log('🎉 VERIFICATION PASSED! Your setup looks good!');
    console.log('\n📚 Next steps:');
    console.log('  1. Test creating a conversation in Dashboard');
    console.log('  2. Try uploading an audio file (if buckets configured)');
    console.log('  3. Navigate through KOE, ARK, and INDI engines');
    console.log('  4. Check TESTING_CHECKLIST.md for complete tests');
  } else {
    console.log('⚠️  SETUP INCOMPLETE - Issues found');
    console.log('\n📚 Recommended actions:');
    console.log('  1. Review BOLT_SUPABASE_SETUP.md');
    console.log('  2. Apply all migration files to Supabase');
    console.log('  3. Configure service role key in .env');
    console.log('  4. Run this script again');
  }
  console.log('='.repeat(60));

  return results;
}

// Export for use
window.verifyTMASetup = verifySetup;

// Auto-run
console.log('💡 Tip: Run window.verifyTMASetup() anytime to re-verify\n');
verifySetup().catch(error => {
  console.error('❌ Verification script failed:', error);
  console.log('\n📚 Check BOLT_SUPABASE_SETUP.md for setup instructions');
});
