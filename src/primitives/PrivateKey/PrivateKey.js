import { secp256k1 as secp } from "@scintilla-network/signatures/classic";
import { fromHex as hexToBytes } from "@scintilla-network/hashes/utils";
import { base58check } from "@scintilla-network/hashes/utils";
import PublicKey from "../PublicKey/PublicKey.js";

class PrivateKey {
    /**
     * Create a PrivateKey from a WIF string
     * @param {string} wif - The WIF string to create the PrivateKey from
     * @returns {PrivateKey} The PrivateKey
     */
    static fromWIF(wif) {
        if (!wif || typeof wif !== 'string') {
            throw new Error('WIF string is required');
        }

        // Decode the WIF string
        const decoded = base58check.decode(wif);

        // WIF format: version(1) + private key(32) + compression flag(1)
        if (decoded.length !== 34) {
            throw new Error('Invalid WIF format');
        }

        // Extract the private key bytes (skip version byte and compression flag)
        const privateKeyBytes = decoded.slice(1, 33);
        return new PrivateKey(privateKeyBytes);
    }

    /**
     * Create a PrivateKey from a key
     * @param {Uint8Array} key - The key to create the PrivateKey from
     * @returns {PrivateKey} The PrivateKey
     */ 
    constructor(key) {
        if (!key) {
            throw new Error('Key is required');
        }

        // Convert input to bytes if needed
        const keyBytes = key instanceof Uint8Array ? key : 
                        typeof key === 'string' ? hexToBytes(key) : 
                        new Uint8Array(key);

        if (!secp.isValidPrivateKey(keyBytes)) {
            throw new Error('Invalid private key');
        }

        Object.defineProperty(this, '_key', {
            value: keyBytes,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    /**
     * Get the private key
     * @returns {Uint8Array} The private key
     */
    getKey() {
        return new Uint8Array(this._key);
    }

    /**
     * Get the public key
     * @returns {PublicKey} The public key
     */
    getPublicKey() {
        const publicKeyBytes = secp.getPublicKey(this._key, true); // true for compressed format
        return new PublicKey(publicKeyBytes);
    }

    /**
     * Serialize the private key
     * @returns {Uint8Array} The serialized private key
     */
    serialize() {
        const key = new Uint8Array(this._key);
        return key;
    }

    /**
     * Convert the private key to a hex string
     * @returns {string} The hex string
     */
    toHexString() {
        // return Buffer.from(this._key).toString('hex');
        return new Uint8Array(this._key).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    }

    /**
     * Convert the private key to a WIF string
     * @param {number} version - The version byte
     * @returns {string} The WIF string
     */
    toWIF(version = 0x80) {
        // Create a buffer with version byte + private key + compression flag
        const buffer = Buffer.alloc(this._key.length + 2);
        buffer[0] = version;
        buffer.set(this._key, 1);
        buffer[buffer.length - 1] = 0x01; // compression flag
        
        return base58check.encode(buffer);
    }

    /**
     * Convert the private key to a string
     * @returns {string} The string
     */
    toString() {
        // purposely do not return as a string
        return PrivateKey.name.toString();
    }
}

export default PrivateKey;