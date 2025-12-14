// Quick test - uses your dashboard config
// Set env vars BEFORE importing modules
process.env.OPENAI_API_KEY = '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';
process.env.DEVTO_API_KEY = '9uJuXaB7R3fHDgN11BCiwyJc';
process.env.DEVTO_ENABLED = 'true';
process.env.MEDIUM_ENABLED = 'false';
process.env.TWITTER_ENABLED = 'false';
process.env.CONTENT_TOPICS = 'AgenticAI,GenerativeAI,LLM,CloudAI,DataScience,ML';
process.env.POST_SCHEDULE = '40 20 * * *';
process.env.OPENAI_MODEL = 'gpt-4-turbo-preview';

import multiPlatformPoster from './src/services/multiPlatformPoster.js';

console.log('🔍 Testing configuration from dashboard...');
console.log('📝 Topics:', process.env.CONTENT_TOPICS);
console.log('⏰ Schedule:', process.env.POST_SCHEDULE);
console.log('');

async function test() {
  try {
    console.log('✅ Verifying platforms...');
    await multiPlatformPoster.verifyAllPlatforms();
    
    console.log('\n🚀 Posting test article...');
    const result = await multiPlatformPoster.postToAllPlatforms();
    
    console.log('\n🎉 SUCCESS!');
    console.log('Results:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

test();
