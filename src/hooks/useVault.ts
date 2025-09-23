// src/hooks/useVault.ts - ETHERS V6
import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACTS, VAULT_ABI, WSEI_ABI } from '@/lib/contracts';

export interface VaultStats {
  userShares: string;
  userBalance: string;
  totalAssets: string;
  totalSupply: string;
  sharePrice: string;
  availableAssets: string;
  minDeposit: string;
  isPaused: boolean;
  wseiBalance: string;
  wseiAllowance: string;
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
  const { signer, account, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Create contract instances
  const getContracts = useCallback(() => {
    if (!signer) return null;
    
    const vaultContract = new ethers.Contract(
      CONTRACTS.VAULT_ADDRESS,
      VAULT_ABI,
      signer
    );
    
    const wseiContract = new ethers.Contract(
      CONTRACTS.WSEI_ADDRESS,
      WSEI_ABI,
      signer
    );

    return { vaultContract, wseiContract };
  }, [signer]);

  // Fetch vault stats
  const fetchStats = useCallback(async () => {
    if (!signer || !account) return;

    setRefreshing(true);
    try {
      const contracts = getContracts();
      if (!contracts) return;

      const { vaultContract, wseiContract } = contracts;

      // Fetch all data in parallel
      const [
        userShares,
        userBalance,
        totalAssets,
        totalSupply,
        sharePrice,
        availableAssets,
        minDeposit,
        isPaused,
        wseiBalance,
        wseiAllowance,
      ] = await Promise.all([
        vaultContract.getUserShareBalance(account),
        vaultContract.getBalanceUser(account),
        vaultContract.totalAssets(),
        vaultContract.totalSupply(),
        vaultContract.getSharePrice(),
        vaultContract.getAvailableAssets(),
        vaultContract.minDeposit(),
        vaultContract.paused(),
        wseiContract.balanceOf(account),
        wseiContract.allowance(account, CONTRACTS.VAULT_ADDRESS),
      ]);

      setStats({
        userShares: ethers.formatEther(userShares),
        userBalance: ethers.formatEther(userBalance),
        totalAssets: ethers.formatEther(totalAssets),
        totalSupply: ethers.formatEther(totalSupply),
        sharePrice: ethers.formatEther(sharePrice),
        availableAssets: ethers.formatEther(availableAssets),
        minDeposit: ethers.formatEther(minDeposit),
        isPaused,
        wseiBalance: ethers.formatEther(wseiBalance),
        wseiAllowance: ethers.formatEther(wseiAllowance),
      });
    } catch (error) {
      console.error('Error fetching vault stats:', error);
    } finally {
      setRefreshing(false);
    }
  }, [signer, account, getContracts]);

  // Approve WSEI spending
  const approveWSEI = useCallback(async (amount: string): Promise<boolean> => {
    if (!signer) {
      console.error('No signer available');
      return false;
    }

    try {
      setLoading(true);
      const contracts = getContracts();
      if (!contracts) return false;

      const { wseiContract } = contracts;
      const amountWei = ethers.parseEther(amount);

      const tx = await wseiContract.approve(CONTRACTS.VAULT_ADDRESS, amountWei);
      await tx.wait();

      await fetchStats();
      return true;
    } catch (error: any) {
      console.error('Error approving WSEI:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [signer, getContracts, fetchStats]);

  // Deposit to vault
  const deposit = useCallback(async (amount: string): Promise<DepositResult> => {
    if (!signer) {
      return { success: false, error: 'No signer available' };
    }

    try {
      setLoading(true);
      const contracts = getContracts();
      if (!contracts) return { success: false, error: 'Failed to get contracts' };

      const { vaultContract } = contracts;
      const amountWei = ethers.parseEther(amount);

      if (stats) {
        const allowance = ethers.parseEther(stats.wseiAllowance);
        if (allowance < amountWei) {
          const approved = await approveWSEI(amount);
          if (!approved) {
            return { success: false, error: 'Failed to approve WSEI' };
          }
        }
      }

      const tx = await vaultContract.depositLiquidity(amountWei, {
        gasLimit: 300000,
      });

      const receipt = await tx.wait();

      let sharesReceived = '0';
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = vaultContract.interface.parseLog(log);
            if (parsed && parsed.name === 'LiquidityAdded') {
              sharesReceived = ethers.formatEther(parsed.args.shares);
              break;
            }
          } catch (e) {
            // Skip unparseable logs
          }
        }
      }

      await fetchStats();

      return {
        success: true,
        txHash: tx.hash,
        shares: sharesReceived,
      };
    } catch (error: any) {
      console.error('Error depositing:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [signer, getContracts, stats, approveWSEI, fetchStats]);

  // Withdraw from vault
  const withdraw = useCallback(async (): Promise<WithdrawResult> => {
    if (!signer) {
      return { success: false, error: 'No signer available' };
    }

    try {
      setLoading(true);
      const contracts = getContracts();
      if (!contracts) return { success: false, error: 'Failed to get contracts' };

      const { vaultContract } = contracts;

      const tx = await vaultContract.withdrawProfits({
        gasLimit: 300000,
      });

      const receipt = await tx.wait();

      let assetsReceived = '0';
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = vaultContract.interface.parseLog(log);
            if (parsed && parsed.name === 'LiquidityRemoved') {
              assetsReceived = ethers.formatEther(parsed.args.assets);
              break;
            }
          } catch (e) {
            // Skip unparseable logs
          }
        }
      }

      await fetchStats();

      return {
        success: true,
        txHash: tx.hash,
        assets: assetsReceived,
      };
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [signer, getContracts, fetchStats]);

  useEffect(() => {
    if (isConnected && account) {
      fetchStats();
    } else {
      setStats(null);
    }
  }, [isConnected, account, fetchStats]);

  return {
    stats,
    loading,
    refreshing,
    deposit,
    withdraw,
    approveWSEI,
    refreshStats: fetchStats,
  };
};