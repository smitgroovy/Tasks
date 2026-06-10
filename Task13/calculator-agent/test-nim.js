// Quick NIM API Test (direct fetch - same as Task10/11)
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.NVIDIA_API_KEY;
console.log('API Key exists:', !!apiKey);
console.log('API Key starts with nvapi:', apiKey?.startsWith('nvapi-'));
console.log('API Key length:', apiKey?.length);

console.log('\nTesting NIM API connection with direct fetch...\n');

try {
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [{ role: 'user', content: 'Say hello in one word.' }],
      max_tokens: 50,
    }),
  });

  console.log('Status:', response.status);

  if (!response.ok) {
    const errBody = await response.text();
    console.log('Error response:', errBody);
  } else {
    const data = await response.json();
    console.log('✅ Success!');
    console.log('Response:', data.choices[0].message.content);
  }
} catch (error) {
  console.log('❌ Error:', error.message);
}
