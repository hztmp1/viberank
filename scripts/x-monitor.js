#!/usr/bin/env node
/**
 * VibeRank X (Twitter) Monitor
 * Fetches mentions of VibeRank and related keywords
 * Requires: TWITTER_BEARER_TOKEN in environment
 */

import https from 'https';

const KEYWORDS = [
  'VibeRank',
  'vibecoding',
  'vibe coding',
  'AI tool ranking',
  'best AI tool',
  'Cursor AI',
  'Claude Code',
  'Lovable',
  'Bolt.new',
  'vibecoding tools'
];

async function searchTwitter(query, bearerToken) {
  return new Promise((resolve) => {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodedQuery}&max_results=10&tweet.fields=created_at,author_id,public_metrics`;

    const req = https.get(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': 'VibeRank-Monitor'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data || []);
        } catch {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
  });
}

async function monitor() {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    console.log('⚠️  TWITTER_BEARER_TOKEN not set. Skipping X monitoring.');
    console.log('   Get token from: https://developer.twitter.com/en/portal/dashboard');
    return;
  }

  console.log('🔍 Monitoring X for VibeRank mentions...');

  for (const keyword of KEYWORDS) {
    console.log(`  Searching: "${keyword}"`);
    const tweets = await searchTwitter(keyword, bearerToken);

    if (tweets.length > 0) {
      console.log(`  📝 Found ${tweets.length} recent tweets for "${keyword}"`);
      for (const tweet of tweets.slice(0, 3)) {
        console.log(`     - ${tweet.text.substring(0, 100)}...`);
      }
    } else {
      console.log(`  📭 No recent tweets for "${keyword}"`);
    }

    await new Promise(r => setTimeout(r, 1000)); // Rate limit respect
  }
}

monitor().catch(console.error);