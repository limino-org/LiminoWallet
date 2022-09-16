import { web3 } from "@/popup/utils/web3";
import { Ref, ref } from 'vue'
import { ethers, utils } from "ethers";
import { getWallet } from "@/popup/store/modules/account";
/**
 * Get gasprice
 * When initiating a transaction or contract call, we can set the price of gas, that is, gas price, which is generally in Gwei (1 eth = 1000000000 Gwei).
 * Gas price can save miners' expenses, but it will also slow down the speed of miners' packaging. Miners will give priority to packaging transactions with high gas price settings. If you want to speed up the transfer, you can set the gas price higher so that you can jump the queue.
 */
export const useGasPrice = () => {
    // Is how much eth you are willing to pay for a unit of gas. Generally, Gwei is used as the unit
    const gasPrice: Ref<string> = ref("0");
    const getGasPrice = async () => {
        const wallet = await getWallet()
        const p = await wallet.provider.getGasPrice()
        gasPrice.value = ethers.utils.formatEther(p);
        return Promise.resolve(gasPrice.value)
    }
    return {
        gasPrice,
        getGasPrice
    }
}