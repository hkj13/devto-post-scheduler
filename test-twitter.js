// Test Twitter API integration - Direct test with twitter-api-v2
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
    appKey: 'N66oodxrUmELVOdwtdN9NP5Ve',
    appSecret: 'kmftJsTxPDdPwacNVVdL1VJMxAM3bdUWW44m8872lFWgkyq1nK',
    accessToken: '1284160382626443264-iRU7DqS6KGKAYaL1tjzUmJhiO8KuUn',
    accessSecret: 'z8hAiElS6zEpAftn0fj7f2FNfiirLzRyMc5JPLZbW7kl5',
});

console.log('🐦 Testing Twitter API...\n');

async function test() {
    try {
        // Step 1: Verify API access
        console.log('Step 1: Verifying API access...');
        const me = await client.v2.me();
        console.log('✅ API verified! Username:', '@' + me.data.username);
        console.log('User ID:', me.data.id);
        console.log('');
        
        // Step 2: Post a test tweet
        console.log('Step 2: Posting test tweet...');
        const testTweet = `🤖 Test tweet from AutoContent Studio!\n\nTesting automated posting integration.\n\nTimestamp: ${new Date().toISOString()}\n\n#DevTest`;
        
        const tweet = await client.v2.tweet(testTweet);
        
        console.log('\n🎉 SUCCESS!');
        console.log('Tweet ID:', tweet.data.id);
        console.log('Tweet URL:', `https://twitter.com/i/status/${tweet.data.id}`);
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.data) {
            console.error('Error data:', JSON.stringify(error.data, null, 2));
        }
        if (error.code) {
            console.error('Error code:', error.code);
        }
        // Print full error for debugging
        console.error('\nFull error:', error);
    }
}

test();
