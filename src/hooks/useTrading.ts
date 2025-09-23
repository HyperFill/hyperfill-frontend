import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACTS, ERC20_ABI } from '../lib/contracts';

interface TokenApproval {
  tokenAddress: string;
  currentAllowance: string;
  requiredAmount: string;
  isApproved: boolean;
}

interface ApprovalCheckResult {
  needsApproval: boolean;
  tokenApprovals: TokenApproval[];
}

export const useTrading = () => {
  const { signer, account } = useWallet();
  const [loading, setLoading] = useState(false);

  const getTokenContract = useCallback((tokenAddress: string) => {
    if (!signer) throw new Error('Wallet not connected');
    return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  }, [signer]);

  const checkTokenAllowance = useCallback(async (
    tokenAddress: string,
    requiredAmount: string
  ): Promise<TokenApproval> => {
    if (!account || !signer) throw new Error('Wallet not connected');

    const tokenContract = getTokenContract(tokenAddress);
    const allowance = await tokenContract.allowance(account, CONTRACTS.SETTLEMENT_ADDRESS);
    const requiredWei = ethers.parseEther(requiredAmount);
    
    return {
      tokenAddress,
      currentAllowance: ethers.formatEther(allowance),
      requiredAmount,
      isApproved: allowance >= requiredWei
    };
  }, [account, signer, getTokenContract]);

  const checkOrderApprovals = useCallback(async (orderData: {
    side: string;
    quantity: string;
    price: string;
    baseAsset: string;
    quoteAsset: string;
  }): Promise<ApprovalCheckResult> => {
    if (!account) throw new Error('Wallet not connected');

    const tokenApprovals: TokenApproval[] = [];

    if (orderData.side.toLowerCase() === 'bid') {
      const quoteAmount = (parseFloat(orderData.quantity) * parseFloat(orderData.price)).toString();
      const quoteApproval = await checkTokenAllowance(orderData.quoteAsset, quoteAmount);
      tokenApprovals.push(quoteApproval);
    } else if (orderData.side.toLowerCase() === 'ask') {
      const baseApproval = await checkTokenAllowance(orderData.baseAsset, orderData.quantity);
      tokenApprovals.push(baseApproval);
    }

    const needsApproval = tokenApprovals.some(approval => !approval.isApproved);

    return {
      needsApproval,
      tokenApprovals
    };
  }, [account, checkTokenAllowance]);

  const approveToken = useCallback(async (
    tokenAddress: string,
    amount: string
  ): Promise<boolean> => {
    if (!signer) throw new Error('Wallet not connected');

    try {
      setLoading(true);
      const tokenContract = getTokenContract(tokenAddress);
      const amountWei = ethers.parseEther(amount);

      const tx = await tokenContract.approve(CONTRACTS.SETTLEMENT_ADDRESS, amountWei);
      await tx.wait();

      return true;
    } catch (error) {
      console.error('Token approval failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [signer, getTokenContract]);

  const approveTokensForOrder = useCallback(async (
    tokenApprovals: TokenApproval[]
  ): Promise<boolean> => {
    for (const approval of tokenApprovals) {
      if (!approval.isApproved) {
        const success = await approveToken(approval.tokenAddress, approval.requiredAmount);
        if (!success) {
          return false;
        }
      }
    }
    return true;
  }, [approveToken]);

  const getTokenSymbol = useCallback(async (tokenAddress: string): Promise<string> => {
    try {
      const tokenContract = getTokenContract(tokenAddress);
      return await tokenContract.symbol();
    } catch (error) {
      console.error('Failed to get token symbol:', error);
      return tokenAddress.slice(0, 6) + '...';
    }
  }, [getTokenContract]);

  return {
    loading,
    checkOrderApprovals,
    approveToken,
    approveTokensForOrder,
    getTokenSymbol,
    checkTokenAllowance,
  };
};