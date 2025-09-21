import ScintillaAddress from "../../primitives/Address/ScintillaAddress.js";
import CosmosAddress from "../../primitives/Address/CosmosAddress.js";
import BitcoinLegacyAddress from "../../primitives/Address/BitcoinLegacyAddress.js";
import BitcoinSegwitAddress from "../../primitives/Address/BitcoinSegWitAddress.js";
import EthereumAddress from "../../primitives/Address/EthereumAddress.js";

class AddressKeyring {
    /**
     * Create an AddressKeyring instance
     * @param {PublicKey|PrivateKey|ExtendedPrivateKey|ExtendedPublicKey} key - The key to create the AddressKeyring from
     */
    constructor(key) {
        // console.log(`Path: m/${options.change}`);
        if (!key) {
            throw new Error('Key is required');
        }

        // If the key has getPublicKey method, it's either a private key or extended public key object
        if ('getPublicKey' in key) {

            this.publicKey = key.getPublicKey();
            // If it also has getPrivateKey, store it privately
            let pk;
            if ('getPrivateKey' in key) {
                pk = key.getPrivateKey();
            } else {
                pk = key?.getKey();
            }
            Object.defineProperty(this, '_privateKey', {
                value: key,
                enumerable: false,
                writable: false,
                configurable: false
            });
        } else if (key.constructor.name === 'PublicKey') {
            // If it's already a public key
            this.publicKey = key;
        } else {
            throw new Error('Invalid key type');
        }
    }

    /**
     * Get the public key
     * @returns {PublicKey} The public key
     */
    getPublicKey() {
        return this.publicKey;
    }

    /**
     * Get the private key
     * @returns {PrivateKey} The private key
     */
    getPrivateKey() {
        if (!this._privateKey) {
            throw new Error('Private key is not available');
        }
        return this._privateKey;
    }

    /**
     * Check if the key is watch-only
     * @returns {boolean} Whether the key is watch-only
     */
    isWatchOnly() {
        return !this._privateKey;
    }

    /**
     * Get the address for the given coin
     * @param {string} coin - The coin to get the address for
     * @returns {Address} The address
     */
    getAddress(coin = 'scintilla') {
        switch (coin?.toLowerCase()) {
            case 'scintilla':
            case 'sct':
                return ScintillaAddress.fromPublicKey(this.publicKey);
            case 'cosmos':
            case 'atom':
                return CosmosAddress.fromPublicKey(this.publicKey);
            case 'bitcoin':
            case 'btc':
                return BitcoinLegacyAddress.fromPublicKey(this.publicKey);
            case 'segwit':
            case 'btc-segwit':
                return BitcoinSegwitAddress.fromPublicKey(this.publicKey);
            case 'ethereum':
            case 'eth':
                return EthereumAddress.fromPublicKey(this.publicKey);
            default:
                throw new Error('Invalid coin');
        }
    }
}

export default AddressKeyring;