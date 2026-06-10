// Props:
//   nfts     — array of nft objects
//   selected — nft object | null
//   onSelect — (nft) => void

export default function NftPanel({ nfts, selected, onSelect }) {
  return (
    <div className="nft-panel">

      <p className="section-title">Your NFTs</p>
      <NftList nfts={nfts} selected={selected} onSelect={onSelect} />

      <p className="section-title">Details</p>
      <NftDetail nft={selected} />

    </div>
  );
}

// ── Thumbnail Strip ────────────────────────────────────────────────────────
function NftList({ nfts, selected, onSelect }) {
  if (!nfts.length) {
    return <div className="nft-list"><p className="state-msg">—</p></div>;
  }

  return (
    <div className="nft-list">
      {nfts.map((nft) => (
        <div
          key={nft.id}
          className={`nft-thumb ${selected?.id === nft.id ? 'active' : ''}`}
          onClick={() => onSelect(nft)}
        >
          {/* TODO: render nft.image in an <img> if available, otherwise show 🖼️ placeholder */}
        </div>
      ))}
    </div>
  );
}

// ── Detail Card ────────────────────────────────────────────────────────────
function NftDetail({ nft }) {
  if (!nft) {
    return (
      <div className="nft-detail">
        <p className="state-msg">No NFT selected</p>
      </div>
    );
  }

  return (
    <div className="nft-detail">
      {/* TODO: render nft.name, nft.collection */}

      <div className="nft-meta">
        {/* TODO: render meta items — asset ID, unit name, supply, creator */}
      </div>

      {/* TODO: render trait chips from nft.traits */}
    </div>
  );
}
