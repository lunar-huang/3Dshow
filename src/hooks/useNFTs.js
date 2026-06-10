import { useState, useEffect } from 'react';

const INDEXER = 'https://mainnet-idx.algonode.cloud';

// Returns: { nfts, loading, error }

export function useNFTs(address) {
  const [nfts,    setNfts]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!address) return;
    // TODO: call fetchNFTs(address) and update state
  }, [address]);

  return { nfts, loading, error };
}

// ── Fetchers ───────────────────────────────────────────────────────────────

async function fetchNFTs(address) {
  // TODO: GET /v2/accounts/{address}/assets
  //       filter assets where amount > 0
  //       call resolveAsset() for each (limit to 20)
  //       return array of resolved nft objects
}

async function resolveAsset(assetId) {
  // TODO: GET /v2/assets/{assetId}
  //       skip assets with total > 1 (fungible tokens)
  //       parse params.url → fetch IPFS metadata JSON
  //       return { id, name, unitName, collection, image, creator, total, traits }
}
