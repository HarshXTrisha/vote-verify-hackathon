# Jan Saarthi

Digital Independence for Informed Democracy

[Live Demo](https://vote-verify-hackathon.vercel.app/)

## Overview
Jan Saarthi empowers voters with clean, verifiable, and comparable candidate data. It turns complex affidavits into a modern, mobile-friendly experience with AI summaries and rich visualizations.
##The Problem: A Crisis of Trust

In August 2025, the national conversation was dominated by the "vote chori" (vote theft) controversy, exposing what the Supreme Court has called a "trust deficit" in our electoral process. Voters are caught between high-profile political allegations and complex, scattered data, making it nearly impossible to form an independent, fact-based opinion. **This is not a political problem; it's an information problem.**


Built for the IIMB BBA(DBE) Vibecoding Hackathon (Independence Day Edition) under the theme: "Digital Independence - Innovating for a Better Tomorrow."

## Features
- Detailed candidate profiles: assets, liabilities, education, profession, criminal cases, affidavits
- Visualizations: asset breakdown (pie), income history (bar)
- AI summaries: plain-language highlights for each candidate
- Side-by-side comparison: compare candidates on key metrics
- Criminal case modal: view details, if any
- Direct affidavit links: verify instantly via official documents
- Language toggle: English/Hindi with animated segmented control
- Hindi display names: localized candidate names when Hindi is selected
- WhatsApp sharing: share individual profiles and comparison view
- Social link preview: Open Graph/Twitter Card set to custom app logo

## Tech Stack
- React (Create React App), React Router
- Chart.js
- i18next + react-i18next + i18next-http-backend
- Custom CSS
- Deployed on Vercel

## Getting Started
Prerequisites: Node.js 14+

Install and run:
```bash
npm install
npm start
```
Build:
```bash
npm run build
```

## Key Files
- Data: `public/candidates.json`
- App: `src/App.js`, `src/App.css`
- Cards & details: `src/CandidateCard.js`, `src/CandidateDetail.js`
- Charts: `src/AssetChart.js`, `src/IncomeChart.js`

## Internationalization (English/Hindi)
- Config: `src/i18n.js`
- Translations: `public/locales/en/translation.json`, `public/locales/hi/translation.json`
- Toggle: animated segmented control in header (`.lang-buttons`)
- Hindi names map: `src/nameMapHi.js` (extend with `id: 'हिंदी नाम'`)

Use in components:
```js
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
return <span>{t('assets')}</span>;
```

## WhatsApp Sharing
- Profile share (in `src/CandidateDetail.js`): green "Share Profile" button builds a message with name, assets, liabilities, cases, then opens `https://wa.me/?text=...` in new tab.
- Comparison share (in `src/App.js` modal): green "Share on WhatsApp" button shares two selected candidates.
- Styles: `.btn.whatsapp` in `src/App.css` (green gradient, shine effect, round icon chip).

## Social Preview (OG/Twitter)
- Configured in `public/index.html`:
  - `og:image`, `twitter:image` → `%PUBLIC_URL%/Gemini_Generated_Image_ngtua4ngtua4ngtu.png`
- After deploy, refresh caches using platform debuggers.

## Data Provenance
All data is sourced from public affidavits on [MyNeta](https://myneta.info), provided by the Election Commission of India (ECI). This tool is informational; please cross-verify via the official links.

## Contributing
- Add/extend translations under `public/locales/<lng>/translation.json`
- Add Hindi names in `src/nameMapHi.js`
- PRs for features/fixes are welcome

## License
MIT

## Acknowledgments
- Election Commission of India (ECI) and MyNeta
- IIMB BBA(DBE) Vibecoding Hackathon
- Cursor AI for development assistance
