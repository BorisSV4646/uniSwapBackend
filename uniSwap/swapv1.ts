import {
  Currency,
  CurrencyAmount,
  Percent,
  Token,
  TradeType,
} from "@uniswap/sdk-core";
import {
  Pool,
  Route,
  SwapOptions,
  SwapQuoter,
  SwapRouter,
  Trade,
} from "@uniswap/v3-sdk";
import { ethers, AbiCoder } from "ethers";
import JSBI from "jsbi";
import { CurrentConfig } from "./utils/config";
import {
  ERC20_ABI,
  QUOTER_CONTRACT_ADDRESS,
  SWAP_ROUTER_ADDRESS,
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
} from "./utils/constant";
import {
  getProvider,
  getWalletAddress,
  sendTransaction,
  TransactionState,
} from "./utils/provider";
import { fromReadableAmount } from "./utils/conversion";
import { getPoolInfo } from "./utils/pool";

export type TokenTrade = Trade<Token, Token, TradeType>;

// Trading Functions

export async function createTrade(): Promise<TokenTrade> {
  const poolInfo = await getPoolInfo();

  const pool = new Pool(
    CurrentConfig.tokens.in,
    CurrentConfig.tokens.out,
    CurrentConfig.tokens.poolFee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    Number(poolInfo.tick)
  );

  const swapRoute = new Route(
    [pool],
    CurrentConfig.tokens.in,
    CurrentConfig.tokens.out
  );

  const amountOut = await getOutputQuote(swapRoute);

  const uncheckedTrade = Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.in,
      fromReadableAmount(
        CurrentConfig.tokens.amountIn,
        CurrentConfig.tokens.in.decimals
      ).toString()
    ),
    outputAmount: CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.out,
      amountOut[0].toString()
    ),
    tradeType: TradeType.EXACT_INPUT,
  });

  return uncheckedTrade;
}

export async function executeTrade(
  trade: TokenTrade
): Promise<TransactionState> {
  const walletAddress = getWalletAddress();
  const provider = getProvider();

  if (!walletAddress || !provider) {
    throw new Error("Cannot execute a trade without a connected wallet");
  }

  // const tokenApproval = await getTokenTransferApproval(CurrentConfig.tokens.in);

  // if (tokenApproval !== TransactionState.Sent) {
  //   return TransactionState.Failed;
  // }

  const options: SwapOptions = {
    slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    recipient: walletAddress,
  };

  console.log(trade);

  const methodParameters = SwapRouter.swapCallParameters([trade], options);

  const tx = {
    data: methodParameters.calldata,
    to: SWAP_ROUTER_ADDRESS,
    value: methodParameters.value,
    from: walletAddress,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  };

  const res = await sendTransaction(tx);

  return res;
}

// Helper Quoting and Pool Functions

async function getOutputQuote(route: Route<Currency, Currency>) {
  const provider = getProvider();

  if (!provider) {
    throw new Error("Provider required to get pool state");
  }

  const { calldata } = await SwapQuoter.quoteCallParameters(
    route,
    CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.in,
      fromReadableAmount(
        CurrentConfig.tokens.amountIn,
        CurrentConfig.tokens.in.decimals
      ).toString()
    ),
    TradeType.EXACT_INPUT,
    {
      useQuoterV2: true,
    }
  );

  const quoteCallReturnData = await provider.call({
    to: QUOTER_CONTRACT_ADDRESS,
    data: calldata,
  });

  const abi = new AbiCoder();
  return abi.decode(["uint256"], quoteCallReturnData);
}

// export async function getTokenTransferApproval(
//   token: Token
// ): Promise<TransactionState> {
//   const provider = getProvider();
//   const address = getWalletAddress();
//   if (!provider || !address) {
//     console.log("No Provider Found");
//     return TransactionState.Failed;
//   }

//   try {
//     const tokenContract = new ethers.Contract(
//       token.address,
//       ERC20_ABI,
//       provider
//     );

//     const transaction = await tokenContract.populateTransaction.approve(
//       SWAP_ROUTER_ADDRESS,
//       fromReadableAmount(
//         TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER,
//         token.decimals
//       ).toString()
//     );

//     return sendTransaction({
//       ...transaction,
//       from: address,
//     });
//   } catch (e) {
//     console.error(e);
//     return TransactionState.Failed;
//   }
// }

async function main() {
  const trade = await createTrade();
  await executeTrade(trade);
}

main();
