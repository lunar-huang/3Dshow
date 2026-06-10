import { useState } from 'react';
import Header   from './components/Header';
import Viewer3D from './components/Viewer3D';
import NftPanel from './components/NftPanel';

export default function App() {
  // TODO: lift wallet + NFT state here and pass down as props
  const [address, setAddress] = useState(null);
  const [nfts,    setNfts]    = useState([]);
  const [selected, setSelected] = useState(null);

  return (
    <div className="app">
      <Header
        address={address}
        onConnect={/* TODO: wire usePeraWallet hook */ () => {}}
        onDisconnect={/* TODO */ () => {}}
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
