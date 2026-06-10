# 3D NFT Viewer

> A mobile-first 3D NFT display page for Algorand. Connect your Pera wallet and explore your NFTs in 3D.

## Features

- [ ] Pera Wallet connection
- [ ] Fetch NFTs via Algorand Indexer (ARC-3 / ARC-69)
- [ ] 3D NFT card viewer (React Three Fiber)
- [ ] Mobile-first UI

## Tech Stack

| Purpose | Library |
|---|---|
| UI | React 18 |
| 3D rendering | Three.js + React Three Fiber + Drei |
| Algorand wallet | Pera Wallet Connect |
| NFT data | Algorand Indexer (algonode.io) |
| Dev server / bundler | Vite |

## Getting Started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

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
    ├── usePeraWallet.js   # wallet connect / disconnect / reconnect
    └── useNFTs.js         # fetch + resolve NFTs from Algorand Indexer
```

## Notes

<!-- Add anything worth knowing about the project here -->
