import { useState, useEffect } from 'react';
import Wallet from 'ethereumjs-wallet';
import { privateToAddress } from 'ethereumjs-util';

const usePrivateKeyToWalletAddress = (privateKey: string) => {
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    if (privateKey) {
      // Ensure the private key has the '0x' prefix
      const prefixedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

      // Create a new wallet instance
      const wallet = Wallet.fromPrivateKey(Buffer.from(prefixedPrivateKey.slice(2), 'hex'));

      // Get the address and return it with '0x' prefix
      const walletAddress = `0x${privateToAddress(wallet.getPrivateKey()).toString('hex')}`;
      setAddress(walletAddress);
    }
  }, [privateKey]);

  return address;
};

export default usePrivateKeyToWalletAddress;
