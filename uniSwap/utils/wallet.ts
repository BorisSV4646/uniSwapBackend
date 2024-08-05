import { Currency, Token } from "@uniswap/sdk-core";
import { ethers, providers } from "ethers";
import { ERC20_ABI } from "./constant";
import { toReadableAmount } from "./conversion";

export async function getCurrencyBalance(
  provider: providers.Provider,
  address: string,
  currency: Currency
): Promise<string> {
  if (currency.isNative) {
    return ethers.utils.formatEther(await provider.getBalance(address));
  }

  if (currency instanceof Token) {
    const walletContract = new ethers.Contract(
      currency.address,
      ERC20_ABI,
      provider
    );
    const balance: number = await walletContract.balanceOf(address);
    const decimals: number = await walletContract.decimals();

    return toReadableAmount(balance, decimals).toString();
  }
}
