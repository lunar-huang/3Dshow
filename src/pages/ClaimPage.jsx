import { useParams, Link } from 'react-router-dom';

export default function ClaimPage({ address, authenticated, login }) {
  const { slug } = useParams();

  return (
    <main className="app" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <Link to="/">Back</Link>
        </div>

        <h1 style={{ marginBottom: 12 }}>Claim Card</h1>
        <p style={{ marginBottom: 8 }}>Card slug: {slug}</p>
        <p style={{ marginBottom: 24 }}>
          {authenticated ? `Logged in as ${address}` : 'Not logged in'}
        </p>

        {!authenticated ? (
          <button className="connect-btn" onClick={login}>
            Login to Claim
          </button>
        ) : (
          <button className="connect-btn" type="button">
            Claim NFT
          </button>
        )}
      </div>
    </main>
  );
}
