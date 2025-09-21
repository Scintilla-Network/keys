import { bech32, hash160 } from '@scintilla-network/hashes/utils';
import IAddress from './IAddress.js';

class ScintillaAddress extends IAddress {
    constructor(publicKey, prefix = 'sct') {
        super(publicKey);
        this.prefix = prefix;
    }

    /**
     * Create a Scintilla address from a public key
     * @param {Uint8Array} publicKey - The public key to create the address from
     * @param {string} [prefix='sct'] - The prefix to create the address for
     * @returns {ScintillaAddress} The Scintilla address
     */
    static fromPublicKey(publicKey, prefix = 'sct') {
        return new ScintillaAddress(publicKey, prefix);
    }

    /**
     * Validate a Scintilla address string
     * @param {string} addressString - The address string to decode
     * @returns {Object} Object (isValid, prefix, pubKeyHash) if valid, otherwise throws an error
     * @throws {Error} If the address is invalid
     */
    static validateAddress(addressString) {
        if (!addressString || typeof addressString !== 'string') {
            throw new Error('Invalid address: must be a non-empty string');
        }

        try {
            // Decode the bech32 address
            const decoded = bech32.decode(addressString);
            // Extract prefix and convert words back to bytes
            const prefix = decoded.prefix;
            const pubKeyHash = bech32.fromWords(decoded.words);

            return {
                isValid: true,
                prefix: prefix,
                pubKeyHash: pubKeyHash
            };
        } catch (error) {
            throw new Error(`Invalid Scintilla address: ${error.message}`);
        }
    }

    /**
     * Get the public key hash
     * @returns {Uint8Array} The public key hash
     */
    getPubKeyHash() {
        // Hash the public key with hash160 (SHA256 + RIPEMD160)
        const hash = hash160(this._publicKey);
        
        return hash;
    }

    /**
     * Convert the address to a string
     * @returns {string} The address string
     */
    toString() {
        const pubKeyHash = this.getPubKeyHash();
        // console.log({pubKeyHashToString: pubKeyHash});
        // Convert to 5-bit words for bech32 encoding
        // console.log({publicKey: this._publicKey});
        const words = bech32.toWords(pubKeyHash);
        // console.log({words});
        // Encode with proper prefix (sct, tsct)
        const address = bech32.encode(this.prefix, words);
        return address;
    }

    /**
     * Validate the address
     * @returns {boolean} Whether the address is valid
     */
    validate() {
        try {
            // Check if prefix contains only lowercase letters
            if (!/^[a-z]+$/.test(this.prefix)) {
                return false;
            }

            const address = this.toString();
            const decoded = bech32.decode(address);
            return decoded.prefix === this.prefix && 
                   bech32.fromWords(decoded.words).length === 20;
        } catch (error) {
            return false;
        }
    }
}

export default ScintillaAddress; 