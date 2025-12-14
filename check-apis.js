// Check if API keys work
import axios from 'axios';

const OPENAI_KEY = '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';
const DEVTO_KEY = '9uJuXaB7R3fHDgN11BCiwyJc';

console.log('🔍 Checking API Keys...\n');

// Check Dev.to
console.log('1️⃣  Checking Dev.to API...');
try {
  const response = await axios.get('https://dev.to/api/articles/me/published', {
    headers: { 'api-key': DEVTO_KEY }
  });
  console.log('✅ Dev.to API: WORKING');
  console.log(`   Found ${response.data.length} published articles`);
} catch (error) {
  console.log('❌ Dev.to API: FAILED');
  console.log(`   Error: ${error.response?.status} - ${error.response?.statusText || error.message}`);
}

console.log('');

// Check OpenAI
console.log('2️⃣  Checking OpenAI API...');
try {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: 'Say "test"' }],
    max_tokens: 10
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  console.log('✅ OpenAI API: WORKING');
  console.log(`   Response: ${response.data.choices[0].message.content}`);
} catch (error) {
  console.log('❌ OpenAI API: FAILED');
  console.log(`   Error: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
}

console.log('\n✅ API Check Complete!');
