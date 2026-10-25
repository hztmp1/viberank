#!/usr/bin/env node
/**
 * VibeRank Signal Fetcher
 * Automates collection of social signals for AI tools from multiple sources
 * Sources: GitHub API, Twitter API (via RapidAPI), Product Hunt API
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '../data/tools.json');

async function fetchGitHubStars(owner, repo) {
  return new Promise((resolve) => {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const req = https.get(url, { headers: { 'User-Agent': 'VibeRank-Bot' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.stargazers_count || 0);
        } catch {
          resolve(0);
        }
      });
    });
    req.on('error', () => resolve(0));
    req.setTimeout(5000, () => { req.destroy(); resolve(0); });
  });
}

async function fetchTwitterMentions(query) {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN?.trim();
  if (!bearerToken) {
    console.log('    ⚠️  TWITTER_BEARER_TOKEN not set, skipping Twitter fetch');
    return 0;
  }

  return new Promise((resolve) => {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodedQuery}&max_results=10&tweet.fields=created_at,author_id,public_metrics`;

    const req = https.get(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': 'VibeRank-Bot'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data?.length || 0);
        } catch {
          resolve(0);
        }
      });
    });
    req.on('error', () => resolve(0));
    req.setTimeout(5000, () => { req.destroy(); resolve(0); });
  });
}

async function fetchProductHuntVotes(slug) {
  const apiKey = process.env.PRODUCTHUNT_ACCESS_TOKEN?.trim();
  if (!apiKey) {
    console.log('    ⚠️  PRODUCTHUNT_ACCESS_TOKEN not set, skipping');
    return 0;
  }

  return new Promise((resolve) => {
    const query = `
      query {
        post(slug: "${slug}") {
          votesCount
        }
      }
    `;
    const data = JSON.stringify({ query });
    const options = {
      hostname: 'api.producthunt.com',
      path: '/v2/api/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve(json.data?.post?.votesCount || 0);
        } catch {
          resolve(0);
        }
      });
    });
    req.on('error', () => resolve(0));
    req.write(data);
    req.end();
  });
}

function calculateScore(signals, category) {
  const weights = {
    vibecoding: { github: 0.4, twitter: 0.3, ph: 0.3 },
    'coding-agents': { github: 0.5, twitter: 0.25, ph: 0.25 },
    'prompt-to-app': { github: 0.3, twitter: 0.4, ph: 0.3 },
    'game-assets': { github: 0.2, twitter: 0.5, ph: 0.3 }
  };

  const w = weights[category] || weights.vibecoding;
  const gh = Math.log10(signals.githubStars + 1) * 10;
  const tw = Math.log10(signals.twitterMentions + 1) * 8;
  const ph = Math.log10(signals.producthuntVotes + 1) * 12;

  return Math.round(gh * w.github + tw * w.twitter + ph * w.ph);
}

async function updateSignals() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(raw);

  console.log('🔄 Fetching signals for', data.tools.length, 'tools...');

  for (const tool of data.tools) {
    console.log(`  Fetching: ${tool.name}...`);

    if (tool.githubRepo) {
      const [owner, repo] = tool.githubRepo.split('/');
      tool.signals.githubStars = await fetchGitHubStars(owner, repo);
    }

    if (tool.twitterQuery) {
      tool.signals.twitterMentions = await fetchTwitterMentions(tool.twitterQuery);
    } else {
      tool.signals.twitterMentions = await fetchTwitterMentions(tool.name);
    }

    if (tool.productHuntSlug) {
      tool.signals.producthuntVotes = await fetchProductHuntVotes(tool.productHuntSlug);
    }

    tool.score = calculateScore(tool.signals, tool.category);
    console.log(`    Signals: GitHub ${tool.signals.githubStars} | Twitter ${tool.signals.twitterMentions} | PH ${tool.signals.producthuntVotes} → Score: ${tool.score}`);
    await new Promise(r => setTimeout(r, 1000));
  }

  data.tools.sort((a, b) => b.score - a.score);
  data.tools.forEach((t, i) => t.rank = i + 1);
  data.lastUpdated = new Date().toISOString().split('T')[0];

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log('✅ Signals updated and rankings recalculated');
}

updateSignals().catch(console.error);