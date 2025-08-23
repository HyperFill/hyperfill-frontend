// src/pages/Index.tsx - VERSION TEST
import { TradingTerminal } from "../components/TradingTerminal";
import { WalletConnect } from "../components/WalletConnect";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header avec wallet */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-semibold">HyperFill Vault</h1>
          <WalletConnect />
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="container mx-auto py-6">
        <TradingTerminal />
      </main>
    </div>
  );
};

export default Index;