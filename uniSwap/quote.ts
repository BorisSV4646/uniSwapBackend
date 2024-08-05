import { CurrentConfig } from "./utils/config";
import { getQuoterContract } from "./utils/provider";
import { fromReadableAmount, toReadableAmount } from "./utils/conversion";
import { getPoolInfo } from "./utils/pool";

async function quote(): Promise<string> {
  const quoterContract = getQuoterContract();
  const poolConstants = await getPoolInfo();

  const params = {
    tokenIn: CurrentConfig.tokens.in.address,
    tokenOut: CurrentConfig.tokens.out.address,
    amountIn: fromReadableAmount(
      CurrentConfig.tokens.amountIn,
      CurrentConfig.tokens.in.decimals
    ).toString(),
    fee: poolConstants.fee,
    sqrtPriceLimitX96: 0,
  };

  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    params
  );

  return toReadableAmount(
    quotedAmountOut[0],
    CurrentConfig.tokens.out.decimals
  );
}

quote().then(console.log);
