#!/usr/bin/env node
/**
 * VibeRank Newsletter Sender
 * Sends generated newsletter via Buttondown API
 * Requires: BUTTONDOWN_API_KEY in environment
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWSLETTER_FILE = path.join(__dirname, '../newsletter-latest.json');

async function sendNewsletter() {
  const apiKey = process.env.BUTTONDOWN_API_KEY?.trim();
  if (!apiKey) {
    console.error('❌ BUTTONDOWN_API_KEY not set in environment');
    console.log('   Get it from: https://buttondown.email/settings/api');
    process.exit(1);
  }

  if (!fs.existsSync(NEWSLETTER_FILE)) {
    console.error('❌ newsletter-latest.json not found. Run "npm run newsletter" first.');
    process.exit(1);
  }

  const { subject, preview_text, body } = JSON.parse(fs.readFileSync(NEWSLETTER_FILE, 'utf-8'));

  const postData = JSON.stringify({
    subject,
    preview_text,
    body,
    publish: true // Set to false to save as draft only
  });

  const options = {
    hostname: 'api.buttondown.email',
    path: '/v1/emails',
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Newsletter sent successfully!');
          console.log('   Status:', res.statusCode);
          console.log('   Response:', data);
          resolve(JSON.parse(data));
        } else {
          console.error('❌ Failed to send newsletter');
          console.error('   Status:', res.statusCode);
          console.error('   Response:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request error:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

sendNewsletter().catch(() => process.exit(1));