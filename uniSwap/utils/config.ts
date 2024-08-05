import { Token } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import { USDC_TOKEN, USDT_TOKEN } from "./constant";
import dotenv from "dotenv";
dotenv.config();

export enum Environment {
  LOCAL,
  MAINNET,
  BNB,
  WALLET_EXTENSION,
}

interface ExampleConfig {
  env: Environment;
  rpc: {
    local: string;
    mainnet: string;
    bnb: string;
  };
  wallet: {
    address: string;
    privateKey: string;
  };
  tokens: {
    in: Token;
    amountIn: number;
    out: Token;
    poolFee: number;
  };
}

export const CurrentConfig: ExampleConfig = {
  env: Environment.BNB,
  rpc: {
    local: "http://localhost:8545",
    mainnet: "https://mainnet.infura.io/v3/0ac57a06f2994538829c14745750d721",
    bnb: "https://bsc-dataseed.bnbchain.org",
  },
  wallet: {
    address: process.env.WALLET_ADDRESS,
    privateKey: process.env.PRIVATE_KEY_GASALLIN,
  },
  tokens: {
    in: USDT_TOKEN,
    amountIn: 1,
    out: USDC_TOKEN,
    poolFee: FeeAmount.LOW,
  },
};
