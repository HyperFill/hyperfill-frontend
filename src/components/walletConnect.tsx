import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, AlertTriangle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

export const WalletConnect = () => {
  const {
    account,
    isConnected,
    isConnecting,
    isOnAptosTestnet,
    connect,
    disconnect,
    switchToAptosTestnet,
    currentWallet
  } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        {!isOnAptosTestnet && (
          <Button
            onClick={switchToAptosTestnet}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Switch to Aptos Testnet
          </Button>
        )}

        <Badge variant={isOnAptosTestnet ? "default" : "destructive"} className="px-3 py-1">
          {isOnAptosTestnet ? "Aptos Testnet" : "Wrong Network"}
        </Badge>

        <Badge variant="outline" className="px-3 py-1">
          {formatAddress(account)}
        </Badge>

        {currentWallet && (
          <Badge variant="secondary" className="px-2 py-1 text-xs">
            {currentWallet.name}
          </Badge>
        )}

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