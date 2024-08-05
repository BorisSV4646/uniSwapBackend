import { computePoolAddress } from "@uniswap/v3-sdk";
import { POOL_FACTORY_CONTRACT_ADDRESS } from "./constant";
import { getPoolContract } from "./provider";
import { CurrentConfig } from "./config";

interface PoolInfo {
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  liquidity: number;
  sqrtPriceX96: string;
  tick: number;
}

export async function getPoolInfo(): Promise<PoolInfo> {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: CurrentConfig.tokens.poolFee,
  });

  const poolContract = getPoolContract(currentPoolAddress);

  const [token0, token1, fee, tickSpacing, liquidity, slot0] =
    await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.tickSpacing(),
      poolContract.liquidity(),
      poolContract.slot0(),
    ]);

  return {
    token0,
    token1,
    fee,
    tickSpacing,
    liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}
