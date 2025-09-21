import { Mnemonic } from "@scintilla-network/mnemonic";
import ChainKeyring from "../ChainKeyring/ChainKeyring.js";
import ExtendedPrivateKey from "../../primitives/ExtendedPrivateKey/ExtendedPrivateKey.js";
import Keyring from "../../primitives/Keyring/Keyring.js";

class SeedKeyring extends Keyring {
    /**
     * @description Create a SeedKeyring instance
     * @param {ExtendedPrivateKey} extendedKey
     */
    constructor(extendedKey) {
        super(extendedKey);
    }

    /**
    * @description Convert a mnemonic to a seed
     * @param {string} mnemonic
     * @returns {Buffer}
     */
    static fromMnemonicToSeed(mnemonic, passphrase = '', wordlistLanguage = 'EN') {
        const seed = new Mnemonic(mnemonic, wordlistLanguage).toSeed(passphrase);
        return seed;
    }

    /**
     * @description Create a SeedKeyring instance from a mnemonic
     * @param {string} mnemonic
     * @returns {SeedKeyring}
     */
    static fromMnemonic(mnemonic, passphrase = '', wordlistLanguage = 'EN') {
        const seed = this.fromMnemonicToSeed(mnemonic, passphrase, wordlistLanguage);
        return this.fromSeed(seed);
    }

    /**
     * @description Create a SeedKeyring instance from a seed
     * @param {Buffer} seed
     * @returns {SeedKeyring}
     */
    static fromSeed(seed) {
        const extendedKey = ExtendedPrivateKey.fromSeed(seed);
        return new SeedKeyring(extendedKey);
    }

    /**
     * @description Get a ChainKeyring instance
     * @param {Object} [options] - Options for the ChainKeyring
     * @param {number} [options.purpose=44] - The purpose of the derivation path
     * @param {number} [options.coinType=8888] - The coin type of the derivation path
     * @param {string} [options.chain="scintilla"] - The chain of the derivation path
     * @returns {ChainKeyring}
     */
    getChainKeyring(options = {}) {
        let { purpose, coinType, chain } = {purpose:44, coinType:8888, chain:'scintilla', ...options};
        
        if(chain && !options.purpose && !options.coinType) {
            switch(chain) {
                case 'bitcoin':
                    purpose = 44;
                    coinType = 0;
                    break;
                case 'testnet-bitcoin':
                    purpose = 44;
                    coinType = 1;
                    break;
                case 'segwit':
                    purpose = 49;
                    coinType = 0;
                    break;
                case 'testnet-segwit':
                    purpose = 49;
                    coinType = 1;
                    break;
                case 'ethereum':
                    purpose = 44;
                    coinType = 60;
                    break;
                case 'cosmos':
                    purpose = 44;
                    coinType = 118;
                    break;
                case 'scintilla':
                    purpose = 44;
                    coinType = 8888;
                    break;
                default:
                    throw new Error(`Unsupported chain: ${chain}`);
            }
        }
        // Derivation path based on BIP44/84
        let path = `m/${purpose}'/${coinType}'`;
        const derivedKey = this._extendedKey.derive(path);
        return new ChainKeyring(derivedKey, {purpose, coinType});
    }
}

export default SeedKeyring;
