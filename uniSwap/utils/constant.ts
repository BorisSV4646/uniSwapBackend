import { ChainId, Token } from "@uniswap/sdk-core";

// Addresses

export const POOL_FACTORY_CONTRACT_ADDRESS =
  "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7";
export const QUOTER_CONTRACT_ADDRESS =
  "0x78D78E420Da98ad378D7799bE8f4AF69033EB077";
export const SWAP_ROUTER_ADDRESS = "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2";
export const V3_SWAP_ROUTER_ADDRESS =
  "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2";

// Currencies and Tokens

export const USDT_TOKEN = new Token(
  ChainId.BNB,
  "0x55d398326f99059fF775485246999027B3197955",
  18,
  "USDT",
  "BSC-USD"
);

export const USDC_TOKEN = new Token(
  ChainId.BNB,
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  18,
  "USDC",
  "Binance-Peg USD Coin"
);

// ABI's

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address _spender, uint256 _value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

// Transactions

export const MAX_FEE_PER_GAS = 100000000000;
export const MAX_PRIORITY_FEE_PER_GAS = 100000000000;
