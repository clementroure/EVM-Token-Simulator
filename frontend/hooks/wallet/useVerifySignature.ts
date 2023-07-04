import { ethers } from 'ethers';
import { useCallback } from 'react';

export function useVerifySignature() {
  const verifySignature = useCallback(async (message: string) => {
    if (window.ethereum) {
      try {
        //@ts-ignore
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        const signature = await signer.signMessage(message);

        // Verify the message
        const signerAddr = ethers.utils.verifyMessage(message, signature);
        if (signerAddr !== address) {
          return false;
        }
        return true;

      } catch (error) {
        console.error('Error:', error)
        return false;
      }
    } else {
      console.error("Non-Ethereum browser detected. You should consider trying MetaMask!");
      return false;
    }
  }, []);

  return verifySignature;
}
