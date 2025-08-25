// src/lib/contracts.ts

// ===== ADDRESSES =====
export const CONTRACTS = {
    VAULT_ADDRESS: "0x2B8C9cd22eFd93e15ff4A7cB7A0ef0A16Eb435C3",
    WSEI_ADDRESS: "0x8eFcF5c2DDDA6C1A63D8395965Ca6c0609CE32D5",
  } as const;
  

  // ===== SEI TESTNET CONFIG =====
  export const SEI_TESTNET = {
    chainId: 1328,
    chainName: "SEI Testnet",
    nativeCurrency: {
      name: "SEI",
      symbol: "SEI", 
      decimals: 18,
    },
    rpcUrls: ["https://evm-rpc-testnet.sei-apis.com"],
    blockExplorerUrls: ["https://seitrace.com"],
  } as const;
  
  // ===== VAULT ABI =====
  export const VAULT_ABI = [
    "function depositLiquidity(uint256 assets) external returns (uint256 shares)",
    "function withdrawProfits() external returns (uint256 assets)",
    "function getUserShareBalance(address user) external view returns (uint256)",
    "function getBalanceUser(address user) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function totalAssets() external view returns (uint256)",
    "function getSharePrice() external view returns (uint256)",
    "function getAvailableAssets() external view returns (uint256)",
    "function minDeposit() external view returns (uint256)",
    "function paused() external view returns (bool)",
    "function asset() external view returns (address)",
    "function previewDeposit(uint256 assets) external view returns (uint256)",
    "function previewRedeem(uint256 shares) external view returns (uint256)",
    "event LiquidityAdded(address indexed user, uint256 assets, uint256 shares)",
    "event LiquidityRemoved(address indexed user, uint256 assets, uint256 shares)"
  ] as const;
  
  // ===== WSEI ABI =====
  export const WSEI_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)",
    "function name() external view returns (string)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function deposit() external payable",
    "function withdraw(uint256 amount) external",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
  ] as const;