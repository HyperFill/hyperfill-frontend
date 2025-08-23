// src/hooks/useWallet.ts
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { SEI_TESTNET } from '@/lib/contracts';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletState {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    account: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    provider: null,
    signer: null,
  });

  // Check if wallet is already connected
  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();

      if (accounts.length > 0) {
        const signer = provider.getSigner();
        setState({
          account: accounts[0],
          isConnected: true,
          isConnecting: false,
          chainId: network.chainId,
          provider,
          signer,
        });
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed!');
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();

      // Check if we're on SEI testnet, if not switch
      if (network.chainId !== SEI_TESTNET.chainId) {
        await switchToSeiTestnet();
        // Recheck network after switch
        const newNetwork = await provider.getNetwork();
        setState({
          account,
          isConnected: true,
          isConnecting: false,
          chainId: newNetwork.chainId,
          provider,
          signer,
        });
      } else {
        setState({
          account,
          isConnected: true,
          isConnecting: false,
          chainId: network.chainId,
          provider,
          signer,
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setState(prev => ({ 
        ...prev, 
        isConnecting: false,
        account: null,
        isConnected: false 
      }));
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState({
      account: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
      provider: null,
      signer: null,
    });
  }, []);

  // Switch to SEI Testnet
  const switchToSeiTestnet = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEI_TESTNET.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${SEI_TESTNET.chainId.toString(16)}`,
                chainName: SEI_TESTNET.chainName,
                nativeCurrency: SEI_TESTNET.nativeCurrency,
                rpcUrls: SEI_TESTNET.rpcUrls,
                blockExplorerUrls: SEI_TESTNET.blockExplorerUrls,
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding SEI testnet:', addError);
          throw addError;
        }
      } else {
        console.error('Error switching to SEI testnet:', switchError);
        throw switchError;
      }
    }
  }, []);

  // Listen to account and network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState(prev => ({ ...prev, account: accounts[0] }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      setState(prev => ({ ...prev, chainId: newChainId }));
      
      // If not on SEI testnet, show warning
      if (newChainId !== SEI_TESTNET.chainId) {
        console.warn('Please switch to SEI Testnet');
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check connection on mount
    checkConnection();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [checkConnection, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    switchToSeiTestnet,
    isOnSeiTestnet: state.chainId === SEI_TESTNET.chainId,
  };
};