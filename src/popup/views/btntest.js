import {TransactionBuilder,payments,ECPair,networks} from "bitcoinjs-lib";
import {selectUTXO} from "./utxo";
import {BitCoin_API, BLOCK_CHAIN_API} from "./contants";
import {ADDRESS_TYPE} from "./type";

export class Transaction {

    static transfer = async ({privateKey,WIF,path,utxos,amount,fromAddress,toAddress,feeRate,opReturnHex = '',segWitType}) => new Promise((resolve, reject) => {
        // const network = isTestnet?networks.testnet:networks.bitcoin;
        const txBuilder = new TransactionBuilder();
        txBuilder.setVersion(1);
        const {inputs = [], outputs = [], fee} = selectUTXO({
            utxos,
            amount,
            fromAddress,
            toAddress,
            feeRate
        });
        if (ADDRESS_TYPE.native_SegWit === segWitType) {
            let keyPair;
            if (WIF) {
                keyPair = ECPair.fromWIF(WIF);
            }else {
                keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey,'hex'));
            }
            const P2WPKH = payments.p2wpkh({pubkey:keyPair.publicKey});
            inputs.forEach(input => txBuilder.addInput(input.tx_hash_big_endian,input.tx_output_n,null,P2WPKH.output));
        }else {
            inputs.forEach(input => txBuilder.addInput(input.tx_hash_big_endian,input.tx_output_n));
        }
        outputs.forEach(output => txBuilder.addOutput(output.address,output.value));

        if (opReturnHex && opReturnHex.length) {
            const data = Buffer.from(opReturnHex,'hex');
            const embed = payments.embed({ data: [data]});
            txBuilder.addOutput(embed.output,0);
        }

        inputs.forEach((input,i) => {
            const {value} = input || {};
            let keyPair;
            if (WIF) {
                keyPair = ECPair.fromWIF(WIF);
            }else {
                keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey,'hex'));
            }
            if (ADDRESS_TYPE.nested_SegWit === segWitType) {
                const P2WPKH = payments.p2wpkh({pubkey:keyPair.publicKey});
                const P2SH = payments.p2sh({redeem:P2WPKH});
                txBuilder.sign(i,keyPair,P2SH.redeem.output,null,value);
            }else if (ADDRESS_TYPE.native_SegWit === segWitType) {
                txBuilder.sign(i, keyPair, null, null, value)
            } else {
                txBuilder.sign(i, keyPair);
            }
        });
        const tx = txBuilder.build();
        const txHex = tx.toHex().toString();
        // blockCypherApi('POST', '/btc/main/txs/push', { tx: tx_hex, token: 'f368d0922a8d4df09d8832192279ffe3' })
        // const url = BLOCK_CHAIN_API+'pushtx' + '?tx=' + txHex;
        const url = 'https://api.blockcypher.com/v1/btc/main/txs/push';

        const headers = {};
        headers['content-type'] = 'application/json';
        headers['accept'] = 'application/json';
        fetch(url, {
            headers,
            method: 'POST',
            body: JSON.stringify({
                tx: txHex,
                token: 'f368d0922a8d4df09d8832192279ffe3',
            })
        }).then(response => {
            return response.json();
        }).then(response => {
            const {error,hash} = response || {};
            if (error) {
                reject(error);
            }else {
                resolve(hash);
            }
        }).catch(reject)

    });
}