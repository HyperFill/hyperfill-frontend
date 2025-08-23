import { Button } from "./ui/button";
import { AgentStatusPanel } from "./ui/agent-status-panel";
import { VaultInterface } from "./ui/vault-interface";
import { TerminalLog } from "./ui/terminal-log";
import { MarketStats } from "./ui/market-stats";
import { Wallet, Settings, Power, Terminal } from "lucide-react";
import { useState } from "react";

export function TradingTerminal() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleConnectWallet = async () => {
    // Simulate wallet connection
    setWalletAddress("sei1abc...xyz789");
    setIsWalletConnected(true);
    alert("Wallet connected successfully!");
  };

  const handleDisconnectWallet = () => {
    setWalletAddress("");
    setIsWalletConnected(false);
    alert("Wallet disconnected!");
  };
  return (
    <div className="min-h-screen bg-background text-foreground p-2 font-terminal max-w-7xl mx-auto">
      {/* Terminal Header */}
      <div className="bg-card border border-border rounded-t-lg p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <div className="w-3 h-3 rounded-full bg-success"></div>
          </div>
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-mono">hyperfill-terminal</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => alert("Settings panel opened!")}>
            <Settings className="h-4 w-4" />
          </Button>
          
          {!isWalletConnected ? (
            <Button 
              variant="terminal" 
              size="sm" 
              className="animate-pulse-glow font-mono"
              onClick={handleConnectWallet}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-green-400">
                {walletAddress}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDisconnectWallet}
              >
                Disconnect
              </Button>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-success">
            <Power className="h-4 w-4" />
            <span className="text-sm font-mono">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="bg-card border border-t-0 border-border rounded-b-lg p-4 min-h-[calc(100vh-100px)]">
        {/* ASCII Header */}
        <div className="text-green-400 font-mono text-xs mb-6 leading-tight">
          <pre>{`
██╗  ██╗██╗   ██╗██████╗ ███████╗██████╗ ███████╗██╗██╗     ██╗     
██║  ██║╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔════╝██║██║     ██║     
███████║ ╚████╔╝ ██████╔╝█████╗  ██████╔╝█████╗  ██║██║     ██║     
██╔══██║  ╚██╔╝  ██╔═══╝ ██╔══╝  ██╔══██╗██╔══╝  ██║██║     ██║     
██║  ██║   ██║   ██║     ███████╗██║  ██║██║     ██║███████╗███████╗
╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝
                                                                      
[SYSTEM] HyperFill Autonomous Trading Terminal v2.1.0
[SYSTEM] Connected to Sei Network (mainnet) 
[SYSTEM] AI Trading Collective: Buffett, Belfort, Lynch & Dalio
[SYSTEM] Vault Status: ACTIVE | TVL: 2,487,329.45 SEI | ROI: +18.7%
[SYSTEM] "We make money while you sleep" - The HyperFill Team
          `}</pre>
        </div>

        {/* Terminal Prompt */}
        <div className="mb-4 text-sm font-mono">
          <span className="text-green-400">hyperfill@sei</span>
          <span className="text-muted-foreground">:</span>
          <span className="text-red-400">~/vault</span>
          <span className="text-muted-foreground">$ </span>
          <span className="text-foreground">status --agents --detailed</span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* Left Column - AI Agents */}
          <div className="col-span-6">
            <AgentStatusPanel />
          </div>

          {/* Right Column - Vault Interface */}
          <div className="col-span-6">
            <VaultInterface />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* Left - Market Stats */}
          <div className="col-span-6">
            <MarketStats />
          </div>
          
          {/* Right - Terminal Log */}
          <div className="col-span-6">
            <TerminalLog />
          </div>
        </div>

        {/* Bottom Terminal Commands */}
        <div className="border-t border-border pt-4">
        <div className="flex items-center space-x-4 mb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs font-mono hover:bg-muted/50"
            onClick={handleConnectWallet}
            disabled={isWalletConnected}
          >
            <Wallet className="h-3 w-3 mr-1" />
            {isWalletConnected ? "./wallet-connected" : "./connect-wallet"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs font-mono hover:bg-muted/50"
            onClick={() => alert("Config panel opened!")}
          >
            <Settings className="h-3 w-3 mr-1" />
            ./config
          </Button>
          <div className="flex items-center space-x-2 text-success text-xs font-mono">
            <Power className="h-3 w-3" />
            <span>DAEMON RUNNING</span>
          </div>
        </div>
          
          <div className="text-xs font-mono text-muted-foreground">
            <span className="text-success">hyperfill@sei</span>
            <span>:</span>
            <span className="text-primary">~/vault</span>
            <span>$ </span>
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs font-mono mt-2 px-2 py-1 bg-muted/30 border border-border rounded">
        <div className="flex items-center space-x-4">
          <span className="text-success">●</span>
          <span>SEI MAINNET</span>
          <span className="text-muted-foreground">|</span>
          <span>BLOCK: 2,487,329</span>
          <span className="text-muted-foreground">|</span>
          <span>GAS: 12 gwei</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>LATENCY: 47ms</span>
          <span className="text-muted-foreground">|</span>
          <span>CPU: 23%</span>
          <span className="text-muted-foreground">|</span>
          <span>MEM: 1.2GB</span>
        </div>
      </div>
    </div>
  );
}