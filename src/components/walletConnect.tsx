// src/components/WalletConnect.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, AlertTriangle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

export const WalletConnect = () => {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    isOnSeiTestnet, 
    connect, 
    disconnect, 
    switchToSeiTestnet 
  } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask);

  // Show install MetaMask message if not installed
  if (!isMetaMaskInstalled) {
    return (
      <Button
        onClick={() => window.open('https://metamask.io/download/', '_blank')}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Wallet className="h-4 w-4" />
        Install MetaMask
      </Button>
    );
  }

  if (isConnected && account) {
    // Handle both string and JsonRpcSigner account types
    const accountAddress = typeof account === 'string' ? account : account;
    
    return (
      <div className="flex items-center gap-2">
        {!isOnSeiTestnet && (
          <Button
            onClick={switchToSeiTestnet}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Switch to SEI Testnet
          </Button>
        )}
        
        <Badge variant={isOnSeiTestnet ? "default" : "destructive"} className="px-3 py-1">
          {isOnSeiTestnet ? "SEI Testnet" : "Wrong Network"}
        </Badge>
        
        <Badge variant="outline" className="px-3 py-1">
          {formatAddress(accountAddress)}
        </Badge>
        
        <Button
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connect}
      disabled={isConnecting}
      className="flex items-center gap-2"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};