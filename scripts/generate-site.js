#!/usr/bin/env node
/**
 * VibeRank Site Generator
 * Reads tools.json and generates index.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '../data/tools.json');
const OUTPUT_FILE = path.join(__dirname, '../index.html');
const BASE_URL = 'https://viberanktools.dpdns.org/';

const CATEGORIES = [
  { id: 'vibecoding', title: 'Best for Vibecoding Full Apps', desc: 'AI-native editors and agent modes for real projects' },
  { id: 'coding-agents', title: 'Best Coding Agents', desc: 'Terminal and cloud agents that write and ship code' },
  { id: 'prompt-to-app', title: 'Best Prompt-to-App Builders', desc: 'Prompt → full app in minutes' },
  { id: 'game-assets', title: 'Best for Game Assets', desc: '3D models, textures, and art pipelines' }
];

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function generateToolItem(tool, index) {
  const badgeColor = index === 0 ? 'bg-sky-600' : 'bg-slate-700';
  const signals = tool.signals || {};
  const signalHtml = `
            <div class="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span class="flex items-center gap-1" title="GitHub Stars">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                ${signals.githubStars || 0}
              </span>
              <span class="flex items-center gap-1" title="Twitter Mentions">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                ${signals.twitterMentions || 0}
              </span>
              <span class="flex items-center gap-1" title="Product Hunt Votes">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                ${signals.producthuntVotes || 0}
              </span>
            </div>`;
  return `
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-7 h-7 rounded-full ${badgeColor} flex items-center justify-center text-sm font-bold">${index + 1}</span>
            <div>
              <div class="font-medium">${tool.name}</div>
              <div class="text-sm text-slate-400">${tool.description}</div>
              ${signalHtml}
            </div>
          </li>`;
}

function generateCategorySection(category, tools) {
  const categoryTools = tools.filter(t => t.category === category.id);
  const itemsHtml = categoryTools.map((t, i) => generateToolItem(t, i)).join('\n');
  return `
      <article class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-sky-700/50 transition">
        <div class="flex items-start justify-between mb-5">
          <h3 class="text-xl font-semibold">${category.title}</h3>
          <span class="text-xs font-medium bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full">${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        </div>
        <ol class="space-y-4">
${itemsHtml}
        </ol>
      </article>`;
}

function generateNewTools(newTools) {
  return newTools.map(tool => {
    const statusColor = tool.status === 'NEW' ? 'text-sky-400' : 'text-amber-400';
    return `
        <div class="bg-slate-950 border border-slate-800 rounded-xl p-5">
          <span class="text-xs font-semibold ${statusColor}">${tool.status}</span>
          <h4 class="font-semibold mt-1">${tool.name}</h4>
          <p class="text-sm text-slate-400 mt-2">${tool.description}</p>
        </div>`;
  }).join('\n');
}

function generateStructuredData(data) {
  const lastUpdated = data.lastUpdated || new Date().toISOString().split('T')[0];

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "VibeRank",
    "url": BASE_URL,
    "description": "Best AI tool for the job. Ranked. Opinionated rankings for vibecoding, coding agents, and builders.",
    "publisher": {
      "@type": "Organization",
      "name": "VibeRank"
    }
  };

  // Deduplicate tools by URL for ItemList
  const seenUrls = new Set();
  const uniqueTools = data.tools
    .filter(t => t.rank <= 12)
    .filter(t => {
      if (seenUrls.has(t.url)) return false;
      seenUrls.add(t.url);
      return true;
    });

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "VibeRank Tool Rankings",
    "description": "Opinionated rankings of AI tools for builders",
    "itemListElement": uniqueTools
      .map((tool, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "SoftwareApplication",
          "name": tool.name,
          "url": tool.url,
          "description": tool.description,
          "applicationCategory": tool.category,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }
      }))
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Rankings", "item": `${BASE_URL}#rankings` }
    ]
  };

  return `
  <!-- Structured data for chatbots & search -->
  <script type="application/ld+json">${JSON.stringify(webSite)}</script>
  <script type="application/ld+json">${JSON.stringify(itemList)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;
}

function generateSitemap(data) {
  const lastUpdated = data.lastUpdated || new Date().toISOString().split('T')[0];

  // Deduplicate tools by URL for sitemap
  const seenUrls = new Set();
  const uniqueTools = data.tools.filter(t => {
    if (seenUrls.has(t.url)) return false;
    seenUrls.add(t.url);
    return true;
  });

  const toolUrls = uniqueTools.map(t => ({
    url: `${BASE_URL}tool/${t.id}/`,
    lastmod: lastUpdated,
    changefreq: 'weekly',
    priority: '0.7'
  }));

  const urls = [
    { url: BASE_URL, lastmod: lastUpdated, changefreq: 'daily', priority: '1.0' },
    { url: `${BASE_URL}#rankings`, lastmod: lastUpdated, changefreq: 'daily', priority: '0.9' },
    { url: `${BASE_URL}#new`, lastmod: lastUpdated, changefreq: 'daily', priority: '0.8' },
    { url: `${BASE_URL}#methodology`, lastmod: lastUpdated, changefreq: 'monthly', priority: '0.5' },
    { url: `${BASE_URL}#submit`, lastmod: lastUpdated, changefreq: 'monthly', priority: '0.5' },
    { url: `${BASE_URL}sponsor.html`, lastmod: lastUpdated, changefreq: 'monthly', priority: '0.5' },
    ...toolUrls
  ];

  const urlElements = urls.map(u => `
    <url>
      <loc>${u.url}</loc>
      <lastmod>${u.lastmod}</lastmod>
      <changefreq>${u.changefreq}</changefreq>
      <priority>${u.priority}</priority>
    </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

function generateRobotsTxt() {
  return `# VibeRank robots.txt
User-agent: *
Allow: /

Sitemap: ${BASE_URL}sitemap.xml
`;
}

function generateHtml(data) {
  const rankingsHtml = CATEGORIES.map(cat => generateCategorySection(cat, data.tools)).join('\n');
  const newToolsHtml = generateNewTools(data.newTools);
  const lastUpdated = data.lastUpdated || new Date().toISOString().split('T')[0];
  const structuredData = generateStructuredData(data);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Best AI tool for the job. Ranked. Opinionated rankings for vibecoding, coding agents, and builders.">
  <meta property="og:title" content="VibeRank - Best AI Tool for the Job. Ranked.">
  <meta property="og:description" content="Opinionated rankings of the AI tools that actually help builders ship — focused on vibecoding, agents, and games.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${BASE_URL}">
  <meta name="twitter:card" content="summary_large_image">
  <title>VibeRank — Best AI Tool for the Job. Ranked.</title>

  ${structuredData}

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            sky: { 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7' }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Inter', system-ui, sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased">

  <!-- Navigation -->
  <nav class="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center font-bold text-white text-sm">V</div>
        <span class="text-xl font-bold tracking-tight">VibeRank</span>
      </a>
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <a href="#rankings" class="hover:text-white transition">Rankings</a>
        <a href="#new" class="hover:text-white transition">New Tools</a>
        <a href="#methodology" class="hover:text-white transition">Methodology</a>
        <a href="sponsor.html" class="hover:text-white transition">Sponsor</a>
        <a href="#submit" class="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg transition">Submit a Tool</a>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <header class="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
    <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
      Best AI tool for the job.<br />
      <span class="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Ranked.</span>
    </h1>
    <p class="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
      Opinionated rankings of the AI tools that actually help builders ship — focused on vibecoding, agents, and games.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="#rankings" class="inline-flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white font-semibold px-8 py-3.5 rounded-xl transition">
        Browse Rankings
      </a>
      <a href="#new" class="inline-flex items-center justify-center border border-slate-700 hover:border-slate-500 font-semibold px-8 py-3.5 rounded-xl transition">
        What's New
      </a>
    </div>
  </header>

  <!-- Rankings -->
  <section id="rankings" class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
    <div class="mb-10">
      <h2 class="text-3xl font-bold mb-2">Top Use-Case Rankings</h2>
      <p class="text-slate-400">Updated for builders. Transparent. Never pay-to-rank.</p>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
${rankingsHtml}
    </div>
  </section>

  <!-- Just Dropped -->
  <section id="new" class="border-y border-slate-800 bg-slate-900/40 py-16">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <h2 class="text-3xl font-bold mb-2">Just Dropped</h2>
      <p class="text-slate-400 mb-8">New and notable tools we're watching (${lastUpdated}).</p>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
${newToolsHtml}
      </div>
    </div>
  </section>

  <!-- Methodology -->
  <section id="methodology" class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
    <h2 class="text-3xl font-bold mb-6">How we rank</h2>
    <div class="max-w-3xl space-y-4 text-slate-300 leading-relaxed">
      <p>We rank tools on criteria that matter to people who actually build:</p>
      <ul class="list-disc pl-5 space-y-2">
        <li>How effectively it solves the specific job</li>
        <li>Speed from idea → working result</li>
        <li>Quality and maintainability of the output</li>
        <li>Pricing clarity and usefulness of the free tier</li>
        <li>Current real-world signal (not just launch hype)</li>
      </ul>
      <p class="text-slate-400 pt-2">Rankings are never sold. <a href="sponsor.html" class="text-sky-400 hover:text-sky-300 underline">Sponsored placements</a> are clearly labeled.</p>
    </div>
  </section>

  <!-- Submit -->
  <section id="submit" class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
    <div class="bg-gradient-to-r from-sky-900/40 to-blue-900/40 border border-sky-800/50 rounded-2xl p-8 md:p-10 text-center">
      <h2 class="text-2xl font-bold mb-3">Built something worth ranking?</h2>
      <p class="text-slate-300 mb-6 max-w-xl mx-auto">Submit your AI tool. We review every submission against the same transparent criteria.</p>
      <a href="mailto:viberank.tools@gmail.com" class="inline-flex bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-3 rounded-xl transition">
        Submit a Tool
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-slate-800 py-10">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">V</div>
        <span class="font-semibold">VibeRank</span>
      </div>
      <p class="text-slate-500 text-sm">Best AI tool for the job. Ranked. · Updated ${lastUpdated}</p>
    </div>
  </footer>

</body>
</html>`;
}

function main() {
  const data = readData();
  const html = generateHtml(data);
  fs.writeFileSync(OUTPUT_FILE, html);
  console.log('✅ Site generated at', OUTPUT_FILE);

  const sitemap = generateSitemap(data);
  fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), sitemap);
  console.log('✅ Sitemap generated at sitemap.xml');

  const robots = generateRobotsTxt();
  fs.writeFileSync(path.join(__dirname, '../robots.txt'), robots);
  console.log('✅ robots.txt generated at robots.txt');
}

main();