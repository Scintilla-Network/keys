import {bech32} from "./bech32.js";
import { ripemd160, sha256 } from "@scintilla-network/hashes/classic";
/**
 * @param {any} message
 * @param {string} publicKey
 * @returns {any}
 */
export default function makeADR36Doc(message, publicKey) {
    if(!publicKey){
        throw new Error('Public key is required for ADR36.');
    }
    let data = message;
    if(message?.toHex) {
        data = message.toHex();
    }
    if(typeof data !== 'string'){
        // data = Buffer.from(data).toString('base64');
        data = new Uint8Array(data).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    }

    // const pubKeyBuffer = Buffer.from(publicKey, 'hex');
    if(publicKey === null) {
        throw new Error('Public key is required for ADR36.');
    }
    const pubKeyBuffer = new Uint8Array(publicKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
    const address = bech32.encode('sct', bech32.toWords(Array.from(ripemd160(sha256(pubKeyBuffer)))));

    return {
        "chain_id": "",
        "account_number": "0",
        "sequence": "0",
        "fee": {
            "gas": "0",
            "amount": []
        },
        "msgs": [
            {
                "type": "sign/MsgSignData",
                "value": {
                    "signer": address,
                    "data":data,
                }
            }
        ],
        "memo": ""
    };
}
