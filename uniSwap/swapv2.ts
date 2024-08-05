import {
  AlphaRouter,
  SwapOptionsSwapRouter02,
  SwapRoute,
  SwapType,
} from "@uniswap/smart-order-router";
import {
  TradeType,
  CurrencyAmount,
  Percent,
  Token,
  ChainId,
} from "@uniswap/sdk-core";
import { CurrentConfig } from "./utils/config";
import {
  getWalletAddress,
  sendTransaction,
  TransactionState,
  getProvider,
} from "./utils/provider";
import {
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  ERC20_ABI,
  V3_SWAP_ROUTER_ADDRESS,
} from "./utils/constant";
import { fromReadableAmount } from "./utils/conversion";
import { ethers } from "ethers";

export async function generateRoute(): Promise<SwapRoute | null> {
  const router = new AlphaRouter({
    chainId: ChainId.BNB,
    provider: getProvider(),
  });

  const options: SwapOptionsSwapRouter02 = {
    recipient: CurrentConfig.wallet.address,
    slippageTolerance: new Percent(50, 10_000),
    deadline: Math.floor(Date.now() / 1000 + 1800),
    type: SwapType.SWAP_ROUTER_02,
  };

  const route = await router.route(
    CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.in,
      fromReadableAmount(
        CurrentConfig.tokens.amountIn,
        CurrentConfig.tokens.in.decimals
      ).toString()
    ),
    CurrentConfig.tokens.out,
    TradeType.EXACT_INPUT,
    options
  );

  return route;
}

export async function executeRoute(
  route: SwapRoute
): Promise<TransactionState> {
  const walletAddress = getWalletAddress();
  const provider = getProvider();

  if (!walletAddress || !provider) {
    throw new Error("Cannot execute a trade without a connected wallet");
  }

  const tokenApproval = await getTokenTransferApproval(CurrentConfig.tokens.in);

  if (tokenApproval !== TransactionState.Sent) {
    return TransactionState.Failed;
  }

  const res = await sendTransaction({
    data: route.methodParameters?.calldata,
    to: V3_SWAP_ROUTER_ADDRESS,
    value: route?.methodParameters?.value,
    from: walletAddress,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  });

  return res;
}

export async function getTokenTransferApproval(
  token: Token
): Promise<TransactionState> {
  const provider = getProvider();
  const address = getWalletAddress();
  if (!provider || !address) {
    console.log("No Provider Found");
    return TransactionState.Failed;
  }

  const amountApprove = fromReadableAmount(
    CurrentConfig.tokens.amountIn,
    token.decimals
  ).toString();

  try {
    const tokenContract = new ethers.Contract(
      token.address,
      ERC20_ABI,
      provider
    );

    const allowance = await tokenContract.allowance(
      address,
      V3_SWAP_ROUTER_ADDRESS
    );

    if (allowance.lt(amountApprove)) {
      const transaction = await tokenContract.populateTransaction.approve(
        V3_SWAP_ROUTER_ADDRESS,
        amountApprove
      );
      return sendTransaction({
        ...transaction,
        from: address,
      });
    }
  } catch (e) {
    console.error(e);
    return TransactionState.Failed;
  }
}

async function main() {
  const route = await generateRoute();
  if (route) {
    const res = await executeRoute(route);
    console.log(res);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
