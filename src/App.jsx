import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Viewer3D from './components/Viewer3D';
import NftPanel from './components/NftPanel';
import { usePrivy } from '@privy-io/react-auth';
import ClaimPage from './pages/ClaimPage';

function HomePage({ address, login, logout, nfts, selected, setSelected }) {
  return (
    <div className="app">
      <Header
        address={address}
        onConnect={login}
        onDisconnect={logout}
      />

      <Viewer3D selectedNft={selected} />

      <NftPanel
        nfts={nfts}
        selected={selected}
        onSelect={setSelected}
      />
    </div>
  );
}

export default function App() {
  const [nfts, setNfts] = useState([]);
  const [selected, setSelected] = useState(null);
  const { ready, authenticated, login, logout, user } = usePrivy();
  const address = authenticated ? user?.email?.address ?? 'Logged in' : null;
  const walletAddress = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet' && account.chainType === 'ethereum'
  )?.address ?? null;

  if (!ready) return null;
  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            address={address}
            login={login}
            logout={logout}
            nfts={nfts}
            selected={selected}
            setSelected={setSelected}
          />
        }
      />
      <Route
        path="/card/:slug"
        element={
          <ClaimPage
            address={address}
            walletAddress={walletAddress}
            authenticated={authenticated}
            login={login}
          />
        }
      />
    </Routes>
  );
}
