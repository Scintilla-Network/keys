import { secp256k1 as secp } from "@scintilla-network/signatures/classic";

class PublicKey {
    constructor(key) {
        if (!key) {
            throw new Error('Key is required');
        }

        // Validate key format
        if (!(key instanceof Uint8Array) || key.length !== 33) {
            throw new Error('Public key must be a 33-byte compressed format');
        }

        // Validate key prefix (compressed format)
        if (key[0] !== 0x02 && key[0] !== 0x03) {
            throw new Error('Public key must be in compressed format (0x02 or 0x03)');
        }

        try {
            const point = secp.Point.fromBytes(key);
            if (point.equals(secp.Point.ZERO)) {
                throw new Error('Invalid public key: point at infinity');
            }
        } catch (error) {
            if(error.message.startsWith('bad point: is not on curve')) {
                throw new Error('Invalid public key: not a valid curve point');
            }
            throw error;
        }

        Object.defineProperty(this, '_key', {
            value: key,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    /**
     * Get the public key
     * @returns {Uint8Array} The public key
     */
    getKey() {
        // Return a copy instead of reference
        return new Uint8Array(this._key);
    }

    /**
     * Convert the public key to a hex string
     * @returns {string} The hex string
     */
    toHexString() {
        // return Buffer.from(this._key).toString('hex');
        return new Uint8Array(this._key).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    }

    /**
     * Convert the public key to a string
     * @returns {string} The string
     */
    toString() {
        return this.toHexString();
    }
}

export default PublicKey;