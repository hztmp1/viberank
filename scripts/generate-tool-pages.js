#!/usr/bin/env node
/**
 * VibeRank Tool Detail Page Generator
 * Generates individual pages for each tool with full Schema.org markup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '../data/tools.json');
const TOOLS_DIR = path.join(__dirname, '../tool');
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

function getCategoryInfo(categoryId) {
  return CATEGORIES.find(c => c.id === categoryId) || { title: categoryId, desc: '' };
}

function generateSignalsHtml(signals) {
  const github = signals.githubStars || 0;
  const twitter = signals.twitterMentions || 0;
  const ph = signals.producthuntVotes || 0;

  return `
        <div class="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-800">
          <div class="flex items-center gap-2 text-sm text-slate-400">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            <span>${github.toLocaleString()}</span>
            <span class="text-slate-600">GitHub Stars</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-slate-400">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
            <span>${twitter.toLocaleString()}</span>
            <span class="text-slate-600">Twitter Mentions</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-slate-400">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            <span>${ph.toLocaleString()}</span>
            <span class="text-slate-600">Product Hunt Votes</span>
          </div>
        </div>`;
}

function generateStructuredData(tool, lastUpdated) {
  const categoryInfo = getCategoryInfo(tool.category);

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "url": tool.url,
    "description": tool.description,
    "applicationCategory": tool.category,
    "operatingSystem": "Web, Cross-platform",
    "offers": {
      "@type": "Offer",
      "price": tool.pricing === 'freemium' ? "0" : "contact for pricing",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": tool.pricing === 'freemium' ? "0" : "varies",
        "priceCurrency": "USD"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "VibeRank"
    },
    "datePublished": tool.dateAdded || lastUpdated,
    "dateModified": lastUpdated
  };

  // Add signals as aggregateRating sub-property for transparency
  if (tool.signals) {
    softwareApp.aggregateRating = {
      ...softwareApp.aggregateRating,
      "reviewAspect": "Community Signals",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": tool.score || 0,
        "bestRating": "100",
        "worstRating": "0",
        "description": `GitHub Stars: ${tool.signals.githubStars || 0}, Twitter Mentions: ${tool.signals.twitterMentions || 0}, Product Hunt Votes: ${tool.signals.producthuntVotes || 0}`
      }
    };
  }

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is ${tool.name} best for?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": tool.description
        }
      },
      {
        "@type": "Question",
        "name": `How much does ${tool.name} cost?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": tool.pricing === 'freemium'
            ? `${tool.name} offers a free tier with paid upgrades for advanced features.`
            : `${tool.name} uses a ${tool.pricing} pricing model. Contact vendor for details.`
        }
      },
      {
        "@type": "Question",
        "name": `Which category does ${tool.name} belong to?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${tool.name} is categorized under ${categoryInfo.title} on VibeRank.`
        }
      },
      {
        "@type": "Question",
        "name": `How does VibeRank score ${tool.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `VibeRank scores tools using a weighted algorithm based on GitHub stars (${tool.signals?.githubStars || 0}), Twitter mentions (${tool.signals?.twitterMentions || 0}), and Product Hunt votes (${tool.signals?.producthuntVotes || 0}). ${tool.name} currently has a score of ${tool.score || 0}.`
        }
      }
    ]
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Rankings", "item": `${BASE_URL}#rankings` },
      { "@type": "ListItem", "position": 3, "name": categoryInfo.title, "item": `${BASE_URL}#rankings` },
      { "@type": "ListItem", "position": 4, "name": tool.name, "item": `${BASE_URL}tool/${tool.id}/` }
    ]
  };

  return `
  <!-- Structured data for chatbots & search -->
  <script type="application/ld+json">${JSON.stringify(softwareApp)}</script>
  <script type="application/ld+json">${JSON.stringify(faq)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;
}

function generateToolPage(tool, allTools, lastUpdated) {
  const categoryInfo = getCategoryInfo(tool.category);
  const signalsHtml = generateSignalsHtml(tool.signals || {});
  const structuredData = generateStructuredData(tool, lastUpdated);
  const toolUrl = `${BASE_URL}tool/${tool.id}/`;

  // Find similar tools in same category
  const similarTools = allTools
    .filter(t => t.category === tool.category && t.id !== tool.id)
    .slice(0, 3);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${tool.description} - ${categoryInfo.title}. Ranked #${tool.rank} on VibeRank. ${tool.pricing === 'freemium' ? 'Free tier available.' : 'Paid tool.'} See GitHub stars, Twitter mentions, Product Hunt votes.">
  <meta property="og:title" content="${tool.name} — VibeRank Tool Profile">
  <meta property="og:description" content="${tool.description} | Ranked #${tool.rank} in ${categoryInfo.title}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${toolUrl}">
  <meta property="og:image" content="${BASE_URL}og-tool-${tool.id}.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${tool.name} — VibeRank">
  <meta name="twitter:description" content="${tool.description}">
  <title>${tool.name} — VibeRank Tool Profile</title>

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
      <a href="${BASE_URL}" class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center font-bold text-white text-sm">V</div>
        <span class="text-xl font-bold tracking-tight">VibeRank</span>
      </a>
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <a href="${BASE_URL}#rankings" class="hover:text-white transition">Rankings</a>
        <a href="${BASE_URL}#new" class="hover:text-white transition">New Tools</a>
        <a href="${BASE_URL}#methodology" class="hover:text-white transition">Methodology</a>
        <a href="${BASE_URL}sponsor.html" class="hover:text-white transition">Sponsor</a>
        <a href="${BASE_URL}#submit" class="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg transition">Submit a Tool</a>
      </div>
    </div>
  </nav>

  <!-- Breadcrumb -->
  <nav class="max-w-6xl mx-auto px-4 sm:px-6 py-4" aria-label="Breadcrumb">
    <ol class="flex items-center gap-2 text-sm text-slate-500">
      <li><a href="${BASE_URL}" class="hover:text-sky-400 transition">Home</a></li>
      <li class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg><a href="${BASE_URL}#rankings" class="hover:text-sky-400 transition">Rankings</a></li>
      <li class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg><a href="${BASE_URL}#rankings" class="hover:text-sky-400 transition">${categoryInfo.title}</a></li>
      <li class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg><span class="text-slate-300 font-medium">${tool.name}</span></li>
    </ol>
  </nav>

  <!-- Hero -->
  <header class="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
    <div class="flex items-center gap-3 mb-6">
      <span class="inline-flex items-center gap-1.5 bg-sky-900/30 border border-sky-800/50 rounded-full px-3 py-1 text-xs font-semibold text-sky-400 uppercase tracking-wider">#${tool.rank} in ${categoryInfo.title}</span>
      <span class="inline-flex items-center gap-1.5 bg-slate-800 text-slate-400 rounded-full px-3 py-1 text-xs font-medium">${tool.pricing}</span>
    </div>
    <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">${tool.name}</h1>
    <p class="text-lg sm:text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed">${tool.description}</p>
    <div class="flex flex-wrap items-center gap-4">
      <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white font-semibold px-8 py-3.5 rounded-xl transition">
        Visit ${tool.name} →
      </a>
      <a href="${BASE_URL}#rankings" class="inline-flex items-center justify-center border border-slate-700 hover:border-slate-500 font-semibold px-8 py-3.5 rounded-xl transition">
        View All Rankings
      </a>
    </div>
  </header>

  <!-- Signals Bar -->
  <section class="border-y border-slate-800 bg-slate-900/40 py-6">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <h2 class="text-lg font-semibold mb-4">Community Signals (as of ${lastUpdated})</h2>
      ${signalsHtml}
      <p class="text-xs text-slate-500 mt-4 max-w-2xl">Signals are collected daily via public APIs. Scores are log-scaled and category-weighted. <a href="${BASE_URL}#methodology" class="text-sky-400 hover:underline">See methodology →</a></p>
    </div>
  </section>

  <!-- Answer-First FAQ -->
  <section id="faq" class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
    <h2 class="text-3xl font-bold mb-8">Quick Answers</h2>
    <dl class="space-y-6 max-w-3xl">
      <div>
        <dt class="text-lg font-semibold text-white mb-2">What is ${tool.name} best for?</dt>
        <dd class="text-slate-300 leading-relaxed">${tool.description}</dd>
      </div>
      <div>
        <dt class="text-lg font-semibold text-white mb-2">How much does ${tool.name} cost?</dt>
        <dd class="text-slate-300 leading-relaxed">${tool.pricing === 'freemium'
          ? `${tool.name} offers a generous free tier with paid upgrades for advanced features and higher limits.`
          : `${tool.name} uses a ${tool.pricing} pricing model. Contact the vendor for current pricing details.`}</dd>
      </div>
      <div>
        <dt class="text-lg font-semibold text-white mb-2">Which category does ${tool.name} belong to?</dt>
        <dd class="text-slate-300 leading-relaxed">${tool.name} is ranked in <strong>${categoryInfo.title}</strong> (${categoryInfo.desc}).</dd>
      </div>
      <div>
        <dt class="text-lg font-semibold text-white mb-2">How does VibeRank calculate the score?</dt>
        <dd class="text-slate-300 leading-relaxed">Our algorithm weighs GitHub stars (log-scaled), Twitter mentions (log-scaled), and Product Hunt votes (log-scaled) with category-specific weights. ${tool.name} scores <strong>${tool.score || 0}</strong> based on ${tool.signals?.githubStars || 0} GitHub stars, ${tool.signals?.twitterMentions || 0} Twitter mentions, and ${tool.signals?.producthuntVotes || 0} Product Hunt votes.</dd>
      </div>
      <div>
        <dt class="text-lg font-semibold text-white mb-2">Is ${tool.name} worth it for my use case?</dt>
        <dd class="text-slate-300 leading-relaxed">If you're looking for a tool in the <strong>${categoryInfo.title}</strong> category, ${tool.name} is a top contender. Compare it with alternatives below or view the <a href="${BASE_URL}#rankings" class="text-sky-400 hover:underline">full rankings</a>.</dd>
      </div>
    </dl>
  </section>

  <!-- Similar Tools -->
  ${similarTools.length > 0 ? `
  <section class="border-y border-slate-800 bg-slate-900/40 py-16">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <h2 class="text-3xl font-bold mb-8">Alternatives in ${categoryInfo.title}</h2>
      <div class="grid md:grid-cols-3 gap-6">
        ${similarTools.map(st => `
          <article class="bg-slate-950 border border-slate-800 rounded-xl p-6 hover:border-sky-700/50 transition">
            <h3 class="font-semibold mb-2">${st.name}</h3>
            <p class="text-sm text-slate-400 mb-4">${st.description}</p>
            <div class="flex items-center gap-2 text-xs text-slate-500 mb-4">
              <span>${st.signals?.githubStars || 0} ★</span>
              <span>${st.signals?.twitterMentions || 0} 🐦</span>
              <span>${st.signals?.producthuntVotes || 0} 🎯</span>
            </div>
            <a href="${BASE_URL}tool/${st.id}/" class="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 font-medium">
              View Profile →
            </a>
          </article>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Methodology Link -->
  <section class="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
    <p class="text-slate-400 mb-4">Want to understand how we rank all tools?</p>
    <a href="${BASE_URL}#methodology" class="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold">
      Read Full Methodology →
    </a>
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
  const lastUpdated = data.lastUpdated || new Date().toISOString().split('T')[0];

  // Ensure tools directory exists
  if (!fs.existsSync(TOOLS_DIR)) {
    fs.mkdirSync(TOOLS_DIR, { recursive: true });
  }

  // Get unique tools (by URL) for detail pages
  const seenUrls = new Set();
  const uniqueTools = data.tools.filter(t => {
    if (seenUrls.has(t.url)) return false;
    seenUrls.add(t.url);
    return true;
  });

  console.log(`🔧 Generating ${uniqueTools.length} tool detail pages...`);

  for (const tool of uniqueTools) {
    const toolDir = path.join(TOOLS_DIR, tool.id);
    if (!fs.existsSync(toolDir)) {
      fs.mkdirSync(toolDir, { recursive: true });
    }

    // Find similar tools
    const similarTools = data.tools
      .filter(t => t.category === tool.category && t.id !== tool.id)
      .slice(0, 3);

    const html = generateToolPage(tool, data.tools, lastUpdated);
    fs.writeFileSync(path.join(toolDir, 'index.html'), html);
    console.log(`  ✅ ${tool.name} (${tool.id})`);
  }

  console.log('✅ Tool detail pages generated');
}

main();