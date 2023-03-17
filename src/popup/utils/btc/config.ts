
import { VUE_APP_NODE_ENV } from "@/popup/enum/env";
const bitcore = require("bitcore-lib");
const { Networks } = bitcore;
export const isProduct = VUE_APP_NODE_ENV === 'production' ? true : false;

export const network = isProduct ? Networks.mainnet : Networks.testnet


// Blockchain network URL
export const baseUrl = isProduct? 'https://api.bitcore.io/api/BTC/mainnet' : `https://api.bitcore.io/api/BTC/testnet`;

// Get fee url
export const gasFeeUrl = 'https://bitcoinfees.earn.com/api/v1/fees/recommended'