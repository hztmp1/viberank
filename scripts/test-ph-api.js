#!/usr/bin/env node
import https from 'https';

const TOKEN = process.env.PRODUCTHUNT_ACCESS_TOKEN || 'D-BSvOR1Izsq2zwVqocq79QJMzZyO7F2qdZ1KXdpty0';

async function testPH(slug) {
  return new Promise((resolve) => {
    const query = `
      query {
        post(slug: "${slug}") {
          name
          votesCount
          tagline
        }
      }
    `;
    const data = JSON.stringify({ query });
    const options = {
      hostname: 'api.producthunt.com',
      path: '/v2/api/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    console.log(`🔍 Testing PH GraphQL for slug: ${slug}...`);
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(responseData);
          console.log(`   Response:`, JSON.stringify(json, null, 2));
          resolve(json);
        } catch {
          console.log(`   Raw: ${responseData}`);
          resolve({ raw: responseData });
        }
      });
    });
    req.on('error', (err) => {
      console.log(`   Error: ${err.message}`);
      resolve({ error: err.message });
    });
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Testing Product Hunt API...');
  await testPH('cursor');
  await testPH('bolt');
  await testPH('lovable');
}

main();