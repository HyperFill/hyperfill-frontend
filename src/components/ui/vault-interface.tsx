import { useState } from "react";
import { Card } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Badge } from "./badge";
import { Separator } from "./separator";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Info } from "lucide-react";

interface VaultStats {
  totalValueLocked: string;
  yourShares: string;
  shareValue: string;
  apy: string;
  performanceFee: string;
  managementFee: string;
}

const vaultStats: VaultStats = {
  totalValueLocked: "2,487,329.45",
  yourShares: "1,250.00",
  shareValue: "1.0423",
  apy: "18.7%",
  performanceFee: "10%",
  managementFee: "2%"
};

export function VaultInterface() {
  const [amount, setAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransaction = async () => {
    const transactionAmount = isDepositing ? amount : vaultStats.yourShares;
    if (!transactionAmount) return;
    
    setIsProcessing(true);
    
    // Simulate transaction
    setTimeout(() => {
      alert(`${isDepositing ? 'Deposit' : 'Withdrawal'} of ${transactionAmount} ${isDepositing ? 'SEI' : 'shares'} initiated!`);
      setAmount("");
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <Card className="bg-card border border-border">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-red-400 font-terminal">[VAULT_INTERFACE]</h3>
            <p className="text-xs text-muted-foreground font-mono">hyperfill autonomous liquidity pool</p>
          </div>
          <Badge variant="success" className="text-xs font-mono animate-terminal-glow">
            TRADING
          </Badge>
        </div>
      </div>

      {/* Vault Stats */}
      <div className="p-3 space-y-3 font-mono text-xs">
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center p-2 bg-muted/20 border border-border/50">
            <span className="text-muted-foreground">total_value_locked:</span>
            <span className="text-red-400 font-bold">{vaultStats.totalValueLocked} SEI</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/20 border border-border/50">
            <span className="text-muted-foreground">current_apy:</span>
            <span className="text-red-400 font-bold animate-pulse">+{vaultStats.apy}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/20 border border-border/50">
            <span className="text-muted-foreground">your_shares:</span>
            <span className="text-foreground">{vaultStats.yourShares}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/20 border border-border/50">
            <span className="text-muted-foreground">share_value:</span>
            <span className="text-foreground">{vaultStats.shareValue} SEI</span>
          </div>
        </div>

        <Separator />

        {/* Transaction Interface */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button
              variant={isDepositing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsDepositing(true)}
              className="flex-1"
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Deposit
            </Button>
            <Button
              variant={!isDepositing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsDepositing(false)}
              className="flex-1"
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>

          {isDepositing ? (
            <div className="space-y-2">
              <Label htmlFor="amount">Deposit Amount</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="Min: 1 SEI"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="terminal-border font-mono pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  SEI
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Withdrawal Amount</Label>
              <div className="relative">
                <Input
                  type="text"
                  value={`${vaultStats.yourShares} SHARES (ALL)`}
                  readOnly
                  className="terminal-border font-mono pr-16 bg-muted/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ALL SHARES
                </span>
              </div>
            </div>
          )}

          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-mono disabled:opacity-50"
            size="lg"
            onClick={handleTransaction}
            disabled={isProcessing || (isDepositing && !amount)}
          >
            <Wallet className="h-4 w-4 mr-2" />
            {isProcessing ? "PROCESSING..." : `${isDepositing ? "./deposit --amount=" + (amount || "XXX") + " --token=SEI" : "./withdraw --shares=" + vaultStats.yourShares + " --all"}`}
          </Button>
        </div>

        <Separator />

        {/* Fee Structure */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Fee Structure</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Performance Fee:</span>
              <span className="font-mono">{vaultStats.performanceFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Management Fee:</span>
              <span className="font-mono">{vaultStats.managementFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Withdrawal Fee:</span>
              <span className="font-mono">0.1%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Access:</span>
              <span className="font-mono">2% TVL</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}