import { hash160, bech32 } from '@scintilla-network/hashes/utils';
import IAddress from './IAddress.js';

// Amino prefixes for Cosmos
const AMINO_SECP256K1_PREFIX = new Uint8Array([0xeb, 0x5a, 0xe9, 0x87, 0x21]);

class CosmosAddress extends IAddress {
    constructor(publicKey, prefix = 'cosmos') {
        // If the public key is a bech32-encoded string, decode it first
        if (typeof publicKey === 'string' && publicKey.startsWith('cosmospub')) {
            const decoded = bech32.decode(publicKey);
            const pubKeyBytes = bech32.fromWords(decoded.words);
            // Check if the decoded bytes already have the amino prefix
            if (pubKeyBytes.length > AMINO_SECP256K1_PREFIX.length &&
                pubKeyBytes.slice(0, AMINO_SECP256K1_PREFIX.length).every((b, i) => b === AMINO_SECP256K1_PREFIX[i])) {
                // Strip the amino prefix as it will be added again in getPubKeyHash
                super(new Uint8Array(pubKeyBytes.slice(AMINO_SECP256K1_PREFIX.length)));
            } else {
                super(new Uint8Array(pubKeyBytes));
            }
        } else {
            super(publicKey);
        }
        this.prefix = prefix;
    }

    /**
     * Create a Cosmos address from a public key
     * @param {Uint8Array} publicKey - The public key to create the address from
     * @param {string} [prefix='cosmos'] - The prefix to create the address for
     * @returns {CosmosAddress} The Cosmos address
     */
    static fromPublicKey(publicKey, prefix = 'cosmos') {
        return new CosmosAddress(publicKey, prefix);
    }

    /**
     * Validate a Cosmos address string
     * @param {string} addressString - The address string to decode
     * @returns {Object} Object (isValid, prefix) if valid, otherwise throws an error
     * @throws {Error} If the address is invalid
     */
    static validateAddress(addressString) {
        if (!addressString || typeof addressString !== 'string') {
            throw new Error('Invalid address: must be a non-empty string');
        }

        try {
            // Decode the bech32 address
            const decoded = bech32.decode(addressString);
            
            // Extract prefix
            const prefix = decoded.prefix;
            
            // Convert words back to bytes to get the pubkey hash
            const pubKeyHash = bech32.fromWords(decoded.words);
            
            // Check if we have a 20-byte hash as expected
            if (pubKeyHash.length !== 20) {
                throw new Error(`Invalid pubkey hash length: ${pubKeyHash.length}`);
            }
            
            return {
                isValid: true,
                prefix: prefix
            };
        } catch (error) {
            throw new Error(`Invalid Cosmos address: ${error.message}`);
        }
    }

    /**
     * Get the public key hash
     * @returns {Uint8Array} The public key hash
     */
    getPubKeyHash() {
        // Hash the public key directly with hash160 (SHA256 + RIPEMD160)
        const hash = hash160(this._publicKey);
        return hash;
    }

    /**
     * Convert the address to a string
     * @returns {string} The address string
     */
    toString() {
        const pubKeyHash = this.getPubKeyHash();
        const words = bech32.toWords(pubKeyHash);
        
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

export default CosmosAddress; 