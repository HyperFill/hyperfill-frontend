import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useTrading } from '../hooks/useTrading';
import { CONTRACTS } from '../lib/contracts';

interface TokenApproval {
  tokenAddress: string;
  currentAllowance: string;
  requiredAmount: string;
  isApproved: boolean;
}

interface ApprovalModalProps {
  isOpen: boolean;
  tokenApprovals: TokenApproval[];
  onApprovalComplete: () => void;
  onCancel: () => void;
}

const Button = ({ children, variant = 'default', size = 'default', className = '', disabled = false, onClick, ...props }) => {
  const variants = {
    default: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    destructive: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    terminal: 'bg-green-600 hover:bg-green-700 text-black font-mono'
  };

  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-md px-8'
  };

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  tokenApprovals,
  onApprovalComplete,
  onCancel,
}) => {
  const { approveToken, getTokenSymbol } = useTrading();
  const [approvingToken, setApprovingToken] = useState<string | null>(null);
  const [approvedTokens, setApprovedTokens] = useState<Set<string>>(new Set());
  const [tokenSymbols, setTokenSymbols] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const loadTokenSymbols = async () => {
        const symbols: Record<string, string> = {};
        for (const approval of tokenApprovals) {
          try {
            symbols[approval.tokenAddress] = await getTokenSymbol(approval.tokenAddress);
          } catch (error) {
            symbols[approval.tokenAddress] = approval.tokenAddress.slice(0, 6) + '...';
          }
        }
        setTokenSymbols(symbols);
      };
      loadTokenSymbols();
    }
  }, [isOpen, tokenApprovals, getTokenSymbol]);

  const handleApproveToken = async (tokenAddress: string, amount: string) => {
    try {
      setApprovingToken(tokenAddress);
      await approveToken(tokenAddress, amount);
      setApprovedTokens(prev => new Set([...prev, tokenAddress]));
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setApprovingToken(null);
    }
  };

  const allApproved = tokenApprovals.every(
    approval => approval.isApproved || approvedTokens.has(approval.tokenAddress)
  );

  const handleContinue = () => {
    if (allApproved) {
      onApprovalComplete();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-mono">
      <div className="bg-gray-900 border border-green-400/30 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-400" />
          <h2 className="text-lg font-bold text-green-400">Token Approval Required</h2>
        </div>
        
        <p className="text-green-300/80 mb-6 text-sm">
          Your order requires token approvals for the settlement contract to execute trades.
        </p>

        <div className="space-y-4 mb-6">
          {tokenApprovals.map((approval) => {
            const tokenSymbol = tokenSymbols[approval.tokenAddress] || 'Loading...';
            const isApproving = approvingToken === approval.tokenAddress;
            const isApproved = approval.isApproved || approvedTokens.has(approval.tokenAddress);

            return (
              <div
                key={approval.tokenAddress}
                className="border border-green-400/20 rounded p-4 bg-gray-800/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-green-400">{tokenSymbol}</span>
                  {isApproved ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                
                <div className="text-xs text-green-300/60 space-y-1">
                  <div>Required: {approval.requiredAmount}</div>
                  <div>Current Allowance: {approval.currentAllowance}</div>
                  <div className="truncate">
                    Token: {approval.tokenAddress}
                  </div>
                </div>

                {!isApproved && (
                  <Button
                    onClick={() => handleApproveToken(approval.tokenAddress, approval.requiredAmount)}
                    disabled={isApproving}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-black font-mono text-xs"
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Approving {tokenSymbol}...
                      </>
                    ) : (
                      `Approve ${tokenSymbol}`
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-green-400/30 text-green-400 hover:bg-green-400/10 font-mono"
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!allApproved}
            className="flex-1 bg-green-600 hover:bg-green-700 text-black font-mono"
          >
            {allApproved ? 'Continue with Order' : 'Approve Tokens First'}
          </Button>
        </div>

        <div className="mt-4 text-xs text-green-300/60 text-center">
          Settlement Contract: {`0xF14d...${CONTRACTS.SETTLEMENT_ADDRESS.slice(-4)}`}
        </div>
      </div>
    </div>
  );
};