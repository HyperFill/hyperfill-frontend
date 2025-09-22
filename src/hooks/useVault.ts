import { useState, useCallback, useEffect } from 'react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { AptosClient } from '@/lib/aptos';
import { CONTRACTS } from '@/lib/contracts';

export interface VaultStats {
  userShares: string;
  userBalance: string;
  totalAssets: string;
  totalSupply: string;
  sharePrice: string;
  availableAssets: string;
  minDeposit: string;
  isPaused: boolean;
  aptBalance: string;
}

export interface DepositResult {
  success: boolean;
  txHash?: string;
  shares?: string;
  error?: string;
}

export interface WithdrawResult {
  success: boolean;
  txHash?: string;
  assets?: string;
  error?: string;
}

export const useVault = () => {
  const { account, connected, signAndSubmitTransaction } = useAptosWallet();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const aptosClient = new AptosClient();

  const fetchStats = useCallback(async () => {
    if (!connected || !account) return;

    setRefreshing(true);
    try {
      const [
        userShares,
        userBalance,
        totalAssets,
        sharePrice,
        availableAssets,
        minDeposit,
        isPaused,
        aptBalance,
      ] = await Promise.all([
        aptosClient.getUserShareBalance(account.address),
        aptosClient.getVaultBalance(account.address),
        aptosClient.getTotalAssets(),
        aptosClient.getSharePrice(),
        aptosClient.getAvailableAssets(),
        aptosClient.getMinDeposit(),
        aptosClient.isPaused(),
        aptosClient.getAccountBalance(account.address),
      ]);

      setStats({
        userShares: aptosClient.formatAPT(userShares),
        userBalance: aptosClient.formatAPT(userBalance),
        totalAssets: aptosClient.formatAPT(totalAssets),
        totalSupply: '0',
        sharePrice: aptosClient.formatAPT(sharePrice),
        availableAssets: aptosClient.formatAPT(availableAssets),
        minDeposit: aptosClient.formatAPT(minDeposit),
        isPaused,
        aptBalance: aptosClient.formatAPT(aptBalance),
      });
    } catch (error) {
      console.error('Error fetching vault stats:', error);
    } finally {
      setRefreshing(false);
    }
  }, [connected, account, aptosClient]);


  const deposit = useCallback(async (amount: string): Promise<DepositResult> => {
    if (!connected || !account) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      setLoading(true);
      const amountOctas = aptosClient.parseAPT(amount);

      const transaction = aptosClient.buildDepositTransaction(account.address, amountOctas);

      const response = await signAndSubmitTransaction(transaction);

      await fetchStats();

      return {
        success: true,
        txHash: response.hash,
        shares: '0',
      };
    } catch (error: any) {
      console.error('Error depositing:', error);
      let errorMessage = 'Unknown error occurred';

      if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [connected, account, signAndSubmitTransaction, aptosClient, fetchStats]);

  const withdraw = useCallback(async (): Promise<WithdrawResult> => {
    if (!connected || !account) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      setLoading(true);

      const transaction = aptosClient.buildWithdrawTransaction(account.address);

      const response = await signAndSubmitTransaction(transaction);

      await fetchStats();

      return {
        success: true,
        txHash: response.hash,
        assets: '0',
      };
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      let errorMessage = 'Unknown error occurred';

      if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [connected, account, signAndSubmitTransaction, aptosClient, fetchStats]);

  useEffect(() => {
    if (connected && account) {
      fetchStats();
    } else {
      setStats(null);
    }
  }, [connected, account, fetchStats]);

  return {
    stats,
    loading,
    refreshing,
    deposit,
    withdraw,
    refreshStats: fetchStats,
  };
};