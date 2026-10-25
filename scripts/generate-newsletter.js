#!/usr/bin/env node
/**
 * VibeRank Newsletter Generator
 * Reads tools.json and generates Buttondown-ready HTML email
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '../data/tools.json');
const NEWSLETTER_NEWSLETTER_BASE_URL = 'https://hztmp1.github.io/viberank/';

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function generateSubject(data) {
  const top3 = data.tools.slice(0, 3).map(t => t.name).join(', ');
  return `VibeRank Weekly — ${top3}`;
}

function generatePreviewText(data) {
  const top3 = data.tools.slice(0, 3).map((t, i) => `#${i+1} ${t.name}`).join(' · ');
  const newTool = data.newTools[0]?.name || '';
  return `${top3}${newTool ? ` + ${newTool}` : ''}`;
}

function generateHtmlEmail(data) {
  const lastUpdated = data.lastUpdated || new Date().toISOString().split('T')[0];
  const dateStr = formatDate(lastUpdated);
  const issueNumber = Math.floor((new Date(lastUpdated) - new Date('2026-10-24')) / (7 * 24 * 60 * 60 * 1000)) + 1;

  // Top 3 tools
  const top3 = data.tools.slice(0, 3);
  const top3Rows = top3.map((tool, i) => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #334155;">
        <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; background: ${i === 0 ? '#0ea5e9' : '#475569'}; color: white; text-align: center; line-height: 24px; font-weight: 700; font-size: 12px;">${i + 1}</span>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #334155;">
        <a href="${tool.url}" style="color: #f8fafc; text-decoration: none; font-weight: 600;">${tool.name}</a>
        <span style="display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 9999px; background: #1e293b; color: #94a3b8; font-size: 11px; font-weight: 500;">${tool.category}</span>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #334155; color: #cbd5e1; font-size: 14px;">${tool.description}</td>
    </tr>`).join('');

  // New tools
  const newTools = data.newTools.slice(0, 3);
  const newToolsHtml = newTools.map(tool => `
    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; background: ${tool.status === 'NEW' ? '#0ea5e9' : '#f59e0b'}; color: white; font-size: 10px; font-weight: 700; text-transform: uppercase;">${tool.status}</span>
        <a href="${tool.url}" style="color: #f8fafc; text-decoration: none; font-weight: 600;">${tool.name}</a>
      </div>
      <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">${tool.description}</p>
    </div>`).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibeRank Weekly #${issueNumber}</title>
</head>
<body style="margin: 0; padding: 0; background: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #020617; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 32px 32px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <span style="display: inline-block; width: 36px; height: 36px; border-radius: 10px; background: white; color: #0ea5e9; text-align: center; line-height: 36px; font-weight: 800; font-size: 16px;">V</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <h1 style="margin: 0; color: white; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">VibeRank Weekly</h1>
                    <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 13px;">${dateStr} · Issue #${issueNumber}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">

              <!-- Top 3 -->
              <h2 style="margin: 0 0 20px; color: #f8fafc; font-size: 18px; font-weight: 700;">Top 3 This Week</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #334155;">
                <thead>
                  <tr style="background: #1e293b;">
                    <th style="padding: 12px 16px; text-align: left; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Rank</th>
                    <th style="padding: 12px 16px; text-align: left; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Tool</th>
                    <th style="padding: 12px 16px; text-align: left; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Why It Matters</th>
                  </tr>
                </thead>
                <tbody>
                  ${top3Rows}
                </tbody>
              </table>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${NEWSLETTER_BASE_URL}" style="display: inline-block; background: #0ea5e9; color: white; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 8px; font-size: 14px;">View Full Rankings →</a>
              </div>

              <!-- Just Dropped -->
              <h2 style="margin: 32px 0 20px; color: #f8fafc; font-size: 18px; font-weight: 700;">🔥 Just Dropped</h2>
              ${newToolsHtml}

              <!-- How We Rank -->
              <div style="margin-top: 32px; padding: 20px; background: #1e293b; border-radius: 8px; border: 1px solid #334155;">
                <h3 style="margin: 0 0 12px; color: #f8fafc; font-size: 14px; font-weight: 600;">How We Rank</h3>
                <p style="margin: 0 0 12px; color: #cbd5e1; font-size: 13px; line-height: 1.6;">
                  No pay-to-rank. Signals: <strong>GitHub stars · Twitter mentions · Product Hunt votes</strong>.
                  Category-weighted, log-scaled, updated daily via GitHub Actions.
                </p>
                <a href="${NEWSLETTER_BASE_URL}#methodology" style="color: #0ea5e9; text-decoration: none; font-size: 13px; font-weight: 500;">See Methodology →</a>
              </div>

              <!-- Submit -->
              <div style="margin-top: 24px; text-align: center;">
                <p style="margin: 0 0 12px; color: #94a3b8; font-size: 13px;">Built something worth ranking?</p>
                <a href="mailto:viberank.tools@gmail.com" style="display: inline-block; border: 1px solid #0ea5e9; color: #0ea5e9; text-decoration: none; font-weight: 600; padding: 10px 24px; border-radius: 8px; font-size: 13px;">Submit Your Tool →</a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: #020617; border-top: 1px solid #1e293b;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <span style="display: inline-block; width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #0ea5e9, #0284c7); text-align: center; line-height: 24px; font-weight: 800; font-size: 11px; color: white;">V</span>
                  </td>
                  <td style="padding-left: 8px; color: #94a3b8; font-size: 12px;">
                    <strong style="color: #cbd5e1;">VibeRank</strong> — Best AI tool for the job. Ranked.
                  </td>
                  <td align="right" style="color: #64748b; font-size: 11px;">
                    <a href="${NEWSLETTER_BASE_URL}" style="color: #64748b; text-decoration: none;">viberank.tools</a> ·
                    <a href="{{ unsubscribe_url }}" style="color: #64748b; text-decoration: none;">Unsubscribe</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html, subject: generateSubject(data), previewText: generatePreviewText(data) };
}

function main() {
  const data = readData();
  const { html, subject, previewText } = generateHtmlEmail(data);

  const output = {
    subject,
    preview_text: previewText,
    body: html
  };

  // Write to file for inspection
  const outFile = path.join(__dirname, '../newsletter-latest.json');
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));
  console.log('✅ Newsletter generated at', outFile);
  console.log('Subject:', subject);
  console.log('Preview:', previewText);
}

main();