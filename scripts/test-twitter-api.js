#!/usr/bin/env node
import https from 'https';

const API_KEY = process.env.RAPIDAPI_KEY || 'c268b6fe32mshca9ad0c4a2796efp1fa300jsn808d2cd73b4e';
const HOST = 'twitter-api45.p.rapidapi.com';

const ENDPOINTS = [
  '/search/search.php?query=VibeRank&type=Top',
  '/search.php?query=VibeRank',
  '/search.php?query=Cursor',
  '/search.php?q=VibeRank',
  '/timeline.php?screenname=Twitter'
];

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      path: path,
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': HOST
      }
    };

    console.log(`🔍 Testing: ${path}...`);
    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          const keys = Object.keys(json);
          console.log(`   Keys: ${keys.slice(0, 5).join(', ')}`);
          if (json.timeline) console.log(`   Timeline items: ${json.timeline.length}`);
          if (json.data) console.log(`   Data items: ${json.data.length}`);
          if (json.results) console.log(`   Results items: ${json.results.length}`);
          resolve({ status: res.statusCode, data: json });
        } catch {
          console.log(`   Raw response: ${data.substring(0, 100)}...`);
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   Error: ${err.message}`);
      resolve({ status: 500, error: err.message });
    });
    req.setTimeout(5000, () => { req.destroy(); resolve({ status: 408 }); });
  });
}

async function main() {
  console.log(`🚀 Validating endpoints for ${HOST}...`);
  for (const ep of ENDPOINTS) {
    await testEndpoint(ep);
    await new Promise(r => setTimeout(r, 1000));
  }
}

main();