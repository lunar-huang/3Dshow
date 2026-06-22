import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ClaimPage({ address, walletAddress, authenticated, login }) {
  const { slug } = useParams();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSucceeded, setClaimSucceeded] = useState(false);
  const [claimError, setClaimError] = useState(null);
  const [card, setCard] = useState(null);
  const [isLoadingCard, setIsLoadingCard] = useState(true);
  const [displayStatus, setDisplayStatus] = useState('UNCLAIMED');

  useEffect(() => {
    async function loadCard() {
      setIsLoadingCard(true);
      setClaimError(null);

      try {
        const response = await fetch(`http://localhost:3001/card/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load card.');
        }

        setCard(data.card);
        setDisplayStatus(data.card.status);
        setClaimSucceeded(data.card.status === 'CLAIMED');
      } catch (error) {
        setClaimError(error.message || 'Failed to load card.');
      } finally {
        setIsLoadingCard(false);
      }
    }

    loadCard();
  }, [slug]);

  async function handleClaim() {
    if (!walletAddress) {
      setClaimError('No wallet address found for this user.');
      return;
    }

    setIsClaiming(true);
    setClaimError(null);

    try {
      const response = await fetch('http://localhost:3001/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardSlug: slug,
          userWallet: walletAddress,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Claim request failed.');
      }

      setClaimSucceeded(true);
      setDisplayStatus('CLAIMED');
    } catch (error) {
      setClaimError(error.message || 'Claim failed.');
    } finally {
      setIsClaiming(false);
    }
  }

  if (isLoadingCard) {
    return (
      <main className="app" style={{ padding: '32px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p>Loading card...</p>
        </div>
      </main>
    );
  }

  if (!card) {
    return (
      <main className="app" style={{ padding: '32px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p>Card not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <Link to="/">Back</Link>
        </div>

        <p style={{ marginBottom: 8 }}>{card.collectionName}</p>
        <p style={{ marginBottom: 8 }}>Serial: {card.serialDisplay}</p>
        <p style={{ marginBottom: 24 }}>Status: {displayStatus}</p>

        <p style={{ marginBottom: 24 }}>
          {authenticated ? `Logged in as ${address}` : 'Not logged in'}
        </p>

        {authenticated && walletAddress ? (
          <p style={{ marginBottom: 24 }}>Wallet: {walletAddress}</p>
        ) : null}

        {claimError ? (
          <p style={{ marginBottom: 24, color: '#c62828' }}>{claimError}</p>
        ) : null}

        {!authenticated ? (
          <button className="connect-btn" onClick={login}>
            Login to Claim
          </button>
        ) : (
          <button
            className="connect-btn"
            type="button"
            onClick={handleClaim}
            disabled={isClaiming || claimSucceeded}
          >
            {claimSucceeded ? 'Claimed' : isClaiming ? 'Claiming...' : 'Claim NFT'}
          </button>
        )}
      </div>
    </main>
  );
}
