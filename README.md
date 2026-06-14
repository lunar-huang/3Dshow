# 3Dshow

> A collectible ownership demo for physical cards, combining 3D presentation, NFC entry, and blockchain-backed ownership on Base.

## Current Direction

- [x] 3D card presentation
- [x] Card texture system
- [ ] Google login + embedded wallet
- [ ] Claim flow
- [ ] Ownership history
- [ ] Transfer flow
- [ ] Lost / replacement flow
- [ ] Issuer dashboard
- [ ] NFC integration

## Tech Stack

| Purpose | Library |
|---|---|
| UI | React 18 |
| 3D rendering | Three.js + React Three Fiber + Drei |
| Chain target | Base |
| Dev server / bundler | Vite |

## Getting Started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Docs

- Demo overview: [expect.md](/Users/gg/Downloads/github/3Dshow/expect.md:1)
- Requirements: [docs/requirements.md](/Users/gg/Downloads/github/3Dshow/docs/requirements.md:1)
- Session A: [docs/sessions/session-a.md](/Users/gg/Downloads/github/3Dshow/docs/sessions/session-a.md:1)
- Entity guide: [docs/guides/entity-writing.md](/Users/gg/Downloads/github/3Dshow/docs/guides/entity-writing.md:1)
- Handbook: [docs/handbook.md](/Users/gg/Downloads/github/3Dshow/docs/handbook.md:1)
- Dev log: [docs/dev-log.md](/Users/gg/Downloads/github/3Dshow/docs/dev-log.md:1)

## Project Structure

```
src/
├── main.jsx               # React entry point
├── App.jsx                # root — holds wallet + NFT state
├── index.css              # global styles
├── components/
│   ├── Header.jsx         # logo + connect button
│   ├── Viewer3D.jsx       # R3F Canvas, NFT card mesh, particles
│   └── NftPanel.jsx       # thumbnail strip + detail card
└── hooks/
    ├── usePeraWallet.js   # legacy wallet hook from earlier prototype
    └── useNFTs.js         # legacy NFT fetch hook from earlier prototype
```

## Notes

- The repo still contains some earlier Algorand-oriented prototype code.
- Product direction is now centered on a Base-based ownership demo for physical collectible cards.
