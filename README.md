# VibeRank

**Opinionated AI tool rankings for builders** — focused on vibecoding, agents, and games.

🌐 **Live:** https://hztmp1.github.io/viberank/
📧 **Submit:** viberank.tools@gmail.com
📰 **Newsletter:** Buttondown (VibeRank)

---

## Quick Start

```bash
# Install dependencies
npm install

# Generate site from data
npm run generate

# Fetch latest signals & regenerate (requires API keys)
npm run fetch-signals

# Monitor X/Twitter mentions
npm run monitor-x
```

---

## Architecture

```
viberank/
├── data/
│   └── tools.json          # Single source of truth (tools, signals, rankings)
├── scripts/
│   ├── fetch-signals.js    # Auto-fetches GitHub/Twitter/PH signals
│   ├── generate-site.js    # Generates index.html from tools.json
│   └── x-monitor.js        # Monitors X for mentions
├── .github/workflows/
│   └── automated-update.yml # Daily automated fetch + deploy
├── index.html              # Generated static site
└── package.json
```

---

## Automation (方案 2: 自动化数据抓取与智能排名)

### Data Pipeline

1. **`fetch-signals.js`** queries:
   - GitHub API → star counts
   - Twitter API (RapidAPI) → mention counts
   - Product Hunt GraphQL → vote counts

2. **Scoring Algorithm** (per category weights):
   - `vibecoding`: 40% GitHub, 30% Twitter, 30% PH
   - `coding-agents`: 50% GitHub, 25% Twitter, 25% PH
   - `prompt-to-app`: 30% GitHub, 40% Twitter, 30% PH
   - `game-assets`: 20% GitHub, 50% Twitter, 30% PH

3. **`generate-site.js`** produces `index.html` with updated rankings

4. **GitHub Actions** runs daily at 06:00 UTC, commits changes, deploys to GitHub Pages

### Required Secrets (GitHub Settings → Secrets → Actions)

| Secret | Source | Purpose |
|--------|--------|---------|
| `RAPIDAPI_KEY` | RapidAPI → Twitter API | Twitter mention counts |
| `PRODUCTHUNT_TOKEN` | Product Hunt Developer Dashboard | PH vote counts |
| `TWITTER_BEARER_TOKEN` | Twitter Developer Portal | X monitoring |

---

## SEO & Chatbot Optimization

- **Structured Data** (schema.org WebSite + ItemList for rankings)
- **Open Graph** & Twitter Card meta tags
- **Semantic HTML** (article, section, header, footer)
- **Clean URLs** & descriptive headings
- **Fast loading** (Tailwind CDN, minimal JS, no render-blocking)

### Chatbot-Friendly Features

- JSON-LD structured data for all tools & rankings
- Explicit category/ranking metadata
- `tools.json` as machine-readable data source
- Semantic markup for easy extraction

---

## Adding New Tools

Edit `data/tools.json` and add to `tools` array:

```json
{
  "id": "unique-id",
  "name": "Tool Name",
  "category": "vibecoding|coding-agents|prompt-to-app|game-assets",
  "description": "One-line description for builders",
  "url": "https://tool.url",
  "pricing": "freemium|subscription|free",
  "tags": ["tag1", "tag2"],
  "githubRepo": "owner/repo",           // optional, for GitHub stars
  "twitterQuery": "Search query",       // optional, for Twitter mentions
  "productHuntSlug": "product-hunt-slug", // optional, for PH votes
  "signals": {
    "githubStars": 0,
    "twitterMentions": 0,
    "producthuntVotes": 0
  }
}
```

Run `npm run fetch-signals && npm run generate` to update.

---

## Newsletter (Buttondown)

- Account: `viberank.tools@gmail.com`
- Name: VibeRank
- Embed signup form in site when ready
- Export: CSV available from Buttondown dashboard

---

## Monetization (Future)

When traffic + trust exist:
- Sponsored tool listings (clearly labeled)
- Affiliate links for paid tools
- Premium newsletter tier
- Job board for AI builders

---

## License

MIT — Build on it, rank with it.