import { ethers, providers, BigNumber, Contract, Wallet } from "ethers";
import { BaseProvider } from "@ethersproject/providers";
import { CurrentConfig } from "./config";
import { QUOTER_CONTRACT_ADDRESS } from "./constant";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";

export enum TransactionState {
  Failed = "Failed",
  New = "New",
  Rejected = "Rejected",
  Sending = "Sending",
  Sent = "Sent",
}

export function getProvider(): BaseProvider {
  return new ethers.providers.JsonRpcProvider(CurrentConfig.rpc.bnb);
}

function createWallet(): Wallet {
  let provider = getProvider();
  return new Wallet(CurrentConfig.wallet.privateKey, provider);
}

export function getWalletAddress(): string | null {
  const wallet = createWallet();
  return wallet.address;
}

export async function sendTransaction(
  transaction: ethers.providers.TransactionRequest
): Promise<TransactionState> {
  const wallet = createWallet();

  if (transaction.value) {
    transaction.value = BigNumber.from(transaction.value);
  }
  const txRes = await wallet.sendTransaction(transaction);
  let receipt: ethers.providers.TransactionReceipt | null = null;

  const provider = getProvider();
  if (!provider) {
    return TransactionState.Failed;
  }

  while (receipt === null) {
    try {
      receipt = await provider.getTransactionReceipt(txRes.hash);

      if (receipt === null) {
        continue;
      }
    } catch (e) {
      console.log(`Receipt error:`, e);
      break;
    }
  }

  if (receipt) {
    return TransactionState.Sent;
  } else {
    return TransactionState.Failed;
  }
}

export function getPoolContract(currentPoolAddress): Contract {
  const provider = getProvider();

  const poolContract = new Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    provider
  );

  return poolContract;
}

export function getQuoterContract(): Contract {
  const provider = getProvider();

  const quoterContract = new Contract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi,
    provider
  );

  return quoterContract;
}
