import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet,
  Settings,
  Power,
  Terminal,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Brain,
  Zap,
  RefreshCw,
  Play,
  Pause,
  BarChart3,
  BookOpen
} from 'lucide-react';

// Mock wallet hook for demo
const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState(null);
  const [isOnSeiTestnet, setIsOnSeiTestnet] = useState(false);

  const connect = async () => {
    setIsConnecting(true);
    setTimeout(() => {
      setAccount('sei1xzlgeyuuyqje79ma6vllregprkmgwgavk8y798');
      setIsConnected(true);
      setIsOnSeiTestnet(true);
      setIsConnecting(false);
    }, 1500);
  };

  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
    setIsOnSeiTestnet(false);
  };

  const switchToSeiTestnet = () => {
    setIsOnSeiTestnet(true);
  };

  return {
    account,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    isOnSeiTestnet,
    switchToSeiTestnet
  };
};

// API Configuration
const API_BASE_URL = import.meta.env?.VITE_ORDERBOOK_API_URL || 'http://localhost:8001';
const AGENT_API_URL = import.meta.env?.VITE_AGENT_API_URL || 'http://localhost:8000';

// API Functions
const api = {
  async registerOrder(orderData) {
    const formData = new FormData();
    formData.append('payload', JSON.stringify(orderData));

    const response = await fetch(`${API_BASE_URL}/api/register_order`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  },

  async getOrderbook(symbol) {
    const formData = new FormData();
    formData.append('payload', JSON.stringify({ symbol }));

    const response = await fetch(`${API_BASE_URL}/api/orderbook`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  },

  async getOrder(orderId) {
    const formData = new FormData();
    formData.append('payload', JSON.stringify({ orderId }));

    const response = await fetch(`${API_BASE_URL}/api/order`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  },

  async getBestOrder(baseAsset, quoteAsset, side) {
    const formData = new FormData();
    formData.append('payload', JSON.stringify({ baseAsset, quoteAsset, side }));

    const response = await fetch(`${API_BASE_URL}/api/get_best_order`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  },

  async cancelOrder(orderId, side, baseAsset, quoteAsset) {
    const formData = new FormData();
    formData.append('payload', JSON.stringify({ orderId, side, baseAsset, quoteAsset }));

    const response = await fetch(`${API_BASE_URL}/api/cancel_order`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  },

  async checkAvailableFunds(account, asset) {
    const formData = new FormData();
    formData.append('payload', JSON.stringify({ account, asset }));

    const response = await fetch(`${API_BASE_URL}/api/check_available_funds`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  },

  async startAgent() {
    const response = await fetch(`${AGENT_API_URL}/start-bot`);
    return await response.json();
  },

  async checkSettlementHealth() {
    const response = await fetch(`${API_BASE_URL}/api/settlement_health`);
    return await response.json();
  }
};

// UI Components
const Button = ({ children, variant = 'default', size = 'default', className = '', disabled = false, onClick, ...props }) => {
  const variants = {
    default: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    destructive: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    terminal: 'bg-green-600 hover:bg-green-700 text-white font-mono'
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

const Card = ({ children, className = '' }) => (
  <div className={`bg-card border border-border rounded-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-border ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-foreground ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    success: 'bg-green-500 text-white',
    destructive: 'bg-red-500 text-white',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border text-foreground'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Input = ({ className = '', ...props }) => (
  <input
    className={`flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Label = ({ children, className = '', ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
    {children}
  </label>
);

// Trading Components
const OrderBookPanel = ({ symbol, orderbook, onRefresh, loading }) => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-mono">ORDER_BOOK</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="font-mono text-xs">
            {symbol}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="p-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          {/* Asks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-red-400">ASKS</span>
              <span className="text-xs font-mono text-muted-foreground">PRICE/SIZE/TOTAL</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {orderbook?.asks?.length > 0 ? (
                orderbook.asks.map((ask, index) => (
                  <div key={index} className="flex justify-between text-xs font-mono">
                    <span className="text-red-400">{ask.price.toFixed(4)}</span>
                    <span className="text-foreground">{ask.amount.toFixed(2)}</span>
                    <span className="text-muted-foreground">{ask.total.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground font-mono">No asks</div>
              )}
            </div>
          </div>

          {/* Spread */}
          <div className="border-t border-b border-border py-2">
            <div className="text-center">
              <span className="text-xs font-mono text-muted-foreground">
                SPREAD: {orderbook?.asks?.[0] && orderbook?.bids?.[0]
                  ? (orderbook.asks[0].price - orderbook.bids[0].price).toFixed(4)
                  : 'N/A'
                }
              </span>
            </div>
          </div>

          {/* Bids */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-green-400">BIDS</span>
              <span className="text-xs font-mono text-muted-foreground">PRICE/SIZE/TOTAL</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {orderbook?.bids?.length > 0 ? (
                orderbook.bids.map((bid, index) => (
                  <div key={index} className="flex justify-between text-xs font-mono">
                    <span className="text-green-400">{bid.price.toFixed(4)}</span>
                    <span className="text-foreground">{bid.amount.toFixed(2)}</span>
                    <span className="text-muted-foreground">{bid.total.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground font-mono">No bids</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TradingPanel = ({ account, onOrderSubmit, loading }) => {
  const [orderType, setOrderType] = useState('limit');
  const [side, setSide] = useState('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [baseAsset, setBaseAsset] = useState('SEI');
  const [quoteAsset, setQuoteAsset] = useState('USDT');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!price || !quantity || !account) return;

    onOrderSubmit({
      account,
      baseAsset,
      quoteAsset,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      side: side === 'buy' ? 'bid' : 'ask',
      privateKey: '0x' + '0'.repeat(64) // Placeholder - in production, handle securely
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-mono">PLACE_ORDER</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={side === 'buy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSide('buy')}
              className={side === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              BUY
            </Button>
            <Button
              type="button"
              variant={side === 'sell' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSide('sell')}
              className={side === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              SELL
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="base-asset" className="font-mono text-xs">BASE</Label>
              <select
                id="base-asset"
                value={baseAsset}
                onChange={(e) => setBaseAsset(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm"
              >
                <option value="SEI">SEI</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
            <div>
              <Label htmlFor="quote-asset" className="font-mono text-xs">QUOTE</Label>
              <select
                id="quote-asset"
                value={quoteAsset}
                onChange={(e) => setQuoteAsset(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm"
              >
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="price" className="font-mono text-xs">PRICE</Label>
            <Input
              id="price"
              type="number"
              step="0.0001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.0000"
              className="font-mono"
            />
          </div>

          <div>
            <Label htmlFor="quantity" className="font-mono text-xs">QUANTITY</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              className="font-mono"
            />
          </div>

          {price && quantity && (
            <div className="text-xs font-mono text-muted-foreground">
              Total: {(parseFloat(price) * parseFloat(quantity)).toFixed(4)} {quoteAsset}
            </div>
          )}

          <Button
            onClick={() => {
              console.log
            }}
            type="submit"
            className="w-full font-mono"
            disabled={loading || !account || !price || !quantity}
            variant={side === 'buy' ? 'default' : 'destructive'}
          >
            {loading ? 'SUBMITTING...' : `${side.toUpperCase()} ${baseAsset}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const AgentStatusPanel = ({ onStartAgent, agentRunning, agentLoading }) => {
  const agents = [
    { name: 'Buffett', status: agentRunning ? 'ACTIVE' : 'STANDBY', pnl: '+12.3%', trades: 47 },
    { name: 'Lynch', status: agentRunning ? 'ACTIVE' : 'STANDBY', pnl: '+8.9%', trades: 23 },
    { name: 'Dalio', status: agentRunning ? 'ACTIVE' : 'STANDBY', pnl: '+15.7%', trades: 31 },
    { name: 'Belfort', status: agentRunning ? 'ACTIVE' : 'STANDBY', pnl: '+22.1%', trades: 89 }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-mono flex items-center gap-2">
          <Brain className="h-4 w-4 text-blue-400" />
          AI_AGENTS
        </CardTitle>
        <Button
          variant={agentRunning ? "destructive" : "terminal"}
          size="sm"
          onClick={onStartAgent}
          disabled={agentLoading}
          className="font-mono text-xs"
        >
          {agentLoading ? (
            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
          ) : agentRunning ? (
            <Pause className="h-3 w-3 mr-1" />
          ) : (
            <Play className="h-3 w-3 mr-1" />
          )}
          {agentLoading ? 'INIT...' : agentRunning ? 'STOP' : 'START'}
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          {agents.map((agent, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${agent.status === 'ACTIVE' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-mono">{agent.name}</span>
                <Badge variant={agent.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-xs">
                  {agent.status}
                </Badge>
              </div>
              <div className="text-xs font-mono text-right">
                <div className={`${agent.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {agent.pnl}
                </div>
                <div className="text-muted-foreground">{agent.trades} trades</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const TerminalLog = ({ logs }) => {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-mono flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-400" />
          TERMINAL_LOG
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div ref={logRef} className="h-48 overflow-y-auto bg-black/20 rounded p-2 font-mono text-xs">
          {logs.map((log, index) => (
            <div key={index} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-foreground'}`}>
              <span className="text-muted-foreground">[{log.timestamp}]</span> {log.message}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const MarketStats = ({ symbol, orderbook }) => {
  const stats = {
    lastPrice: orderbook?.asks?.[0]?.price || orderbook?.bids?.[0]?.price || 0,
    change24h: '+5.23%',
    volume24h: '2.4M',
    high24h: '0.3456',
    low24h: '0.3123'
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-mono flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-400" />
          MARKET_STATS
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground font-mono">LAST_PRICE</div>
            <div className="text-lg font-mono text-foreground">{stats.lastPrice.toFixed(4)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-mono">24H_CHANGE</div>
            <div className="text-lg font-mono text-green-400">{stats.change24h}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-mono">24H_VOLUME</div>
            <div className="text-lg font-mono text-foreground">{stats.volume24h}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-mono">24H_RANGE</div>
            <div className="text-sm font-mono text-foreground">{stats.low24h} - {stats.high24h}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Trading Terminal Component
export function TradingTerminal() {
  const {
    account,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    isOnSeiTestnet,
    switchToSeiTestnet
  } = useWallet();

  const [orderbook, setOrderbook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [logs, setLogs] = useState([
    { timestamp: new Date().toLocaleTimeString(), message: 'System initialized', type: 'info' },
    { timestamp: new Date().toLocaleTimeString(), message: 'Waiting for wallet connection...', type: 'info' }
  ]);

  const currentSymbol = 'SEI_USDT';

  const addLog = (message, type = 'info') => {
    const newLog = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  };

  const loadOrderbook = async () => {
    setLoading(true);
    try {
      const response = await api.getOrderbook(currentSymbol);
      if (response.status_code === 1) {
        setOrderbook(response.orderbook);
        addLog(`Orderbook loaded: ${response.orderbook.asks?.length || 0} asks, ${response.orderbook.bids?.length || 0} bids`);
      } else {
        addLog('Failed to load orderbook', 'error');
      }
    } catch (error) {
      addLog(`Orderbook error: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  const handleOrderSubmit = async (orderData) => {
    setLoading(true);
    try {
      addLog(`Submitting ${orderData.side} order: ${orderData.quantity} ${orderData.baseAsset} @ ${orderData.price}`);
      const response = await api.registerOrder(orderData);

      if (response.status_code === 1) {
        addLog(`Order submitted successfully. ID: ${response.order.orderId}`, 'success');
        if (response.order.trades?.length > 0) {
          addLog(`Order matched! ${response.order.trades.length} trades executed`, 'success');
        }
        // Refresh orderbook after successful order
        await loadOrderbook();
      } else {
        addLog(`Order failed: ${response.message}`, 'error');
      }
    } catch (error) {
      addLog(`Order error: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  const handleStartAgent = async () => {
    setAgentLoading(true);
    try {
      if (agentRunning) {
        setAgentRunning(false);
        addLog('AI agents stopped', 'info');
      } else {
        addLog('Starting AI agents...');
        const response = await api.startAgent();
        if (response.status === 'success') {
          setAgentRunning(true);
          addLog('AI agents activated', 'success');
        } else {
          addLog(`Agent start failed: ${response.message}`, 'error');
        }
      }
    } catch (error) {
      addLog(`Agent error: ${error.message}`, 'error');
    }
    setAgentLoading(false);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Auto-refresh orderbook
  useEffect(() => {
    if (isConnected) {
      loadOrderbook();
      const interval = setInterval(loadOrderbook, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Add connection logs
  useEffect(() => {
    if (isConnected) {
      addLog(`Wallet connected: ${formatAddress(account)}`, 'success');
    }
  }, [isConnected, account]);

  return (
    <div className="min-h-screen bg-black text-green-400 p-2 font-mono max-w-7xl mx-auto">
      {/* Terminal Header */}
      <div className="bg-gray-900 border border-green-400/30 rounded-t-lg p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <Terminal className="h-4 w-4 text-green-400" />
          <span className="text-sm text-green-400">hyperfill-terminal</span>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => addLog('Settings panel opened')}>
            <Settings className="h-4 w-4" />
          </Button>

          {/* Network Warning */}
          {isConnected && !isOnSeiTestnet && (
            <Button
              onClick={switchToSeiTestnet}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2 font-mono text-xs"
            >
              <AlertTriangle className="h-4 w-4" />
              WRONG_NETWORK
            </Button>
          )}

          {!isConnected ? (
            <Button
              variant="terminal"
              size="sm"
              className="animate-pulse font-mono"
              onClick={connect}
              disabled={isConnecting}
            >
              <Wallet className="h-4 w-4 mr-2" />
              {isConnecting ? "CONNECTING..." : "Connect Wallet"}
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-green-400">
                {formatAddress(account)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="font-mono text-xs"
              >
                disconnect
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-2 text-green-400">
            <Power className="h-4 w-4" />
            <span className="text-sm font-mono">
              {isConnected && isOnSeiTestnet ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="bg-gray-900 border border-t-0 border-green-400/30 rounded-b-lg p-4 min-h-[calc(100vh-100px)]">
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
[SYSTEM] Connected to Sei Network (testnet) 
[SYSTEM] AI Trading Collective: Buffett, Belfort, Lynch & Dalio
[SYSTEM] Vault Status: ${isConnected && isOnSeiTestnet ? 'ACTIVE' : 'STANDBY'} | Network: ${isOnSeiTestnet ? 'SEI-TESTNET' : 'UNKNOWN'}
[SYSTEM] "We make money while you sleep" - The HyperFill Team
          `}</pre>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-400/20 rounded font-mono text-xs">
            <span className="text-red-400">[ERROR]</span>
            <span className="text-gray-400"> No wallet connection detected. Execute </span>
            <span className="text-green-400">connect-wallet</span>
            <span className="text-gray-400"> to establish connection.</span>
          </div>
        )}

        {/* Terminal Prompt */}
        <div className="mb-4 text-sm font-mono">
          <span className="text-green-400">hyperfill@sei</span>
          <span className="text-gray-400">:</span>
          <span className="text-red-400">~/vault</span>
          <span className="text-gray-400">$ </span>
          <span className="text-green-400">status --agents --detailed</span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* Left Column - AI Agents */}
          <div className="col-span-6">
            <AgentStatusPanel
              onStartAgent={handleStartAgent}
              agentRunning={agentRunning}
              agentLoading={agentLoading}
            />
          </div>

          {/* Right Column - Trading Panel */}
          <div className="col-span-6">
            <TradingPanel
              account={account}
              onOrderSubmit={handleOrderSubmit}
              loading={loading}
            />
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* Left - Order Book */}
          <div className="col-span-6">
            <OrderBookPanel
              symbol={currentSymbol}
              orderbook={orderbook}
              onRefresh={loadOrderbook}
              loading={loading}
            />
          </div>

          {/* Right - Market Stats */}
          <div className="col-span-6">
            <MarketStats
              symbol={currentSymbol}
              orderbook={orderbook}
            />
          </div>
        </div>

        {/* Bottom Row - Terminal Log */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          <div className="col-span-12">
            <TerminalLog logs={logs} />
          </div>
        </div>

        {/* Bottom Terminal Commands */}
        <div className="border-t border-green-400/30 pt-4">
          <div className="flex items-center space-x-4 mb-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-mono hover:bg-green-400/10 text-green-400"
              onClick={connect}
              disabled={isConnected || isConnecting}
            >
              <Wallet className="h-3 w-3 mr-1" />
              {isConnected ? "./wallet-connected" : "./connect-wallet"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-mono hover:bg-green-400/10 text-green-400"
              onClick={loadOrderbook}
              disabled={loading}
            >
              <BookOpen className="h-3 w-3 mr-1" />
              ./refresh-orderbook
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-mono hover:bg-green-400/10 text-green-400"
              onClick={() => addLog('Config panel opened')}
            >
              <Settings className="h-3 w-3 mr-1" />
              ./config
            </Button>
            <div className="flex items-center space-x-2 text-green-400 text-xs font-mono">
              <Power className="h-3 w-3" />
              <span>DAEMON {isConnected && isOnSeiTestnet ? 'RUNNING' : 'STANDBY'}</span>
            </div>
          </div>

          <div className="text-xs font-mono text-green-400">
            <span className="text-green-400">hyperfill@sei</span>
            <span className="text-gray-400">:</span>
            <span className="text-red-400">~/vault</span>
            <span className="text-gray-400">$ </span>
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs font-mono mt-2 px-2 py-1 bg-gray-800/50 border border-green-400/30 rounded">
        <div className="flex items-center space-x-4">
          <span className={isConnected && isOnSeiTestnet ? "text-green-400" : "text-red-400"}>●</span>
          <span className="text-green-400">{isOnSeiTestnet ? "SEI TESTNET" : "DISCONNECTED"}</span>
          <span className="text-gray-400">|</span>
          <span className="text-green-400">STATUS: {isConnected ? (isOnSeiTestnet ? "ACTIVE" : "WRONG_NET") : "OFFLINE"}</span>
          <span className="text-gray-400">|</span>
          <span className="text-green-400">WALLET: {isConnected ? "CONNECTED" : "NONE"}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-green-400">LATENCY: {isConnected ? "47ms" : "∞"}</span>
          <span className="text-gray-400">|</span>
          <span className="text-green-400">AGENTS: {agentRunning ? "4/4" : "0/4"}</span>
          <span className="text-gray-400">|</span>
          <span className="text-green-400">ORDERS: {orderbook ? (orderbook.asks?.length || 0) + (orderbook.bids?.length || 0) : 0}</span>
        </div>
      </div>
    </div>
  );
}