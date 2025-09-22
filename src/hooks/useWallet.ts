import { useState, useEffect, useCallback } from 'react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { APTOS_TESTNET } from '@/lib/contracts';

export interface WalletState {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  network: string | null;
  aptosClient: Aptos | null;
  isNetworkSwitching: boolean;
}

export const useWallet = () => {
  const {
    connect: aptosConnect,
    disconnect: aptosDisconnect,
    account: aptosAccount,
    connected: aptosConnected,
    connecting: aptosConnecting,
    wallet: currentWallet,
  } = useAptosWallet();

  const [state, setState] = useState<WalletState>({
    account: null,
    isConnected: false,
    isConnecting: false,
    network: null,
    aptosClient: null,
    isNetworkSwitching: false,
  });

  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptosClient = new Aptos(aptosConfig);

  const switchToAptosTestnet = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isNetworkSwitching: true }));

    try {
      setState(prev => ({
        ...prev,
        isNetworkSwitching: false,
        network: APTOS_TESTNET.name,
      }));
      return true;
    } catch (error: any) {
      console.error('Error switching to Aptos Testnet:', error);
      setState(prev => ({ ...prev, isNetworkSwitching: false }));
      throw new Error(`Failed to switch to Aptos Testnet: ${error.message}`);
    }
  }, []);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      await aptosConnect();

      setState(prev => ({ ...prev, isConnecting: false }));

    } catch (error: any) {
      console.error('Connection error:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        isNetworkSwitching: false,
        account: null,
        isConnected: false,
      }));

      if (error.code === 4001) {
        throw new Error('Connection rejected by user. Please approve the connection to continue.');
      } else if (error.code === -32002) {
        throw new Error('Connection request already pending. Please check your wallet.');
      } else if (error.message) {
        throw error;
      } else {
        throw new Error(`Connection failed: ${error.toString()}`);
      }
    }
  }, [aptosConnect]);

  const checkConnection = useCallback(async () => {
    try {
      if (aptosConnected && aptosAccount) {
        setState(prev => ({
          ...prev,
          account: aptosAccount.address,
          isConnected: true,
          isConnecting: false,
          network: APTOS_TESTNET.name,
          aptosClient,
          isNetworkSwitching: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isConnected: false,
          account: null,
        }));
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        isNetworkSwitching: false,
      }));
    }
  }, [aptosConnected, aptosAccount, aptosClient]);

  const disconnect = useCallback(async () => {
    try {
      await aptosDisconnect();
      setState({
        account: null,
        isConnected: false,
        isConnecting: false,
        network: null,
        aptosClient: null,
        isNetworkSwitching: false,
      });
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }, [aptosDisconnect]);

  useEffect(() => {
    checkConnection();
  }, [aptosConnected, aptosAccount, checkConnection]);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      isConnecting: aptosConnecting,
      isConnected: aptosConnected,
      account: aptosAccount?.address || null,
      aptosClient,
      network: aptosConnected ? APTOS_TESTNET.name : null,
    }));
  }, [aptosConnecting, aptosConnected, aptosAccount, aptosClient]);

  return {
    ...state,
    connect,
    disconnect,
    switchToAptosTestnet,
    isOnAptosTestnet: state.network === APTOS_TESTNET.name,
    needsNetworkSwitch: false,
    currentWallet,
  };
};