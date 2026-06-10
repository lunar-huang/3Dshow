import { useState, useEffect } from 'react';

// Returns: { address, connect, disconnect }

export function usePeraWallet() {
  const [address, setAddress]     = useState(null);
  const [peraWallet, setPeraWallet] = useState(null);

  useEffect(() => {
    // TODO: import PeraWalletConnect, create an instance, store in state
    //       also call peraWallet.reconnectSession() here to restore a previous session
  }, []);

  async function connect() {
    // TODO: call peraWallet.connect(), get accounts array, store accounts[0] in address
  }

  function disconnect() {
    // TODO: call peraWallet.disconnect(), clear address state
  }

  return { address, connect, disconnect };
}
