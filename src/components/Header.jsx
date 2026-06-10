// Props:
//   address    — string | null   (connected wallet address)
//   onConnect  — () => void
//   onDisconnect — () => void

export default function Header({ address, onConnect, onDisconnect }) {
  const shortAddr = (addr) => `${addr.slice(0, 4)}…${addr.slice(-4)}`;

  return (
    <header className="header">
      <div className="logo">3D NFT</div>

      <button
        className="connect-btn"
        onClick={address ? onDisconnect : onConnect}
      >
        {address ? shortAddr(address) : 'Connect Wallet'}
      </button>
    </header>
  );
}
