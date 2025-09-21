import { keccak256 } from '@scintilla-network/hashes/pq';
import { secp256k1 as secp } from "@scintilla-network/signatures/classic";
import IAddress from './IAddress.js';

class EthereumAddress extends IAddress {
    constructor(publicKey) {
        // Handle PublicKey instance
        if (publicKey?.getKey) {
            publicKey = publicKey.getKey();
        }

        // Convert Buffer to Uint8Array if needed
        if (Buffer.isBuffer(publicKey)) {
            publicKey = new Uint8Array(publicKey);
        }

        // Validate input type
        if (!(publicKey instanceof Uint8Array)) {
            throw new Error('Public key must be a Uint8Array');
        }

        // Store original public key for getPublicKey()
        const originalKey = new Uint8Array(publicKey);

        // Validate and potentially decompress the public key
        let processedKey;
        if (publicKey.length === 33) {
            // Decompress the key
            const point = secp.Point.fromBytes(publicKey);
            processedKey = point.toBytes(false).slice(1); // Remove 0x04 prefix
        } else if (publicKey.length === 65 && publicKey[0] === 0x04) {
            // Remove the 0x04 prefix from uncompressed key
            processedKey = publicKey.slice(1);
        } else {
            throw new Error('Invalid public key length');
        }

        super(processedKey);
        this._originalKey = originalKey;
    }
    /**
     * Get the public key
     * @returns {Uint8Array} The public key
     */
    getPublicKey() {
        return this._originalKey;
    }

    /**
     * Create an Ethereum address from a public key
     * @param {Uint8Array} publicKey - The public key to create the address from
     * @returns {EthereumAddress} The Ethereum address
     */
    static fromPublicKey(publicKey) {
        // Handle PublicKey instance
        if (publicKey?.getKey) {
            publicKey = publicKey.getKey();
        }

        // Convert Buffer to Uint8Array if needed
        if (Buffer.isBuffer(publicKey)) {
            publicKey = new Uint8Array(publicKey);
        }

        // Validate input type
        if (!(publicKey instanceof Uint8Array)) {
            throw new Error('Public key must be a Uint8Array');
        }

        // Validate length
        if (publicKey.length !== 33 && (publicKey.length !== 65 || publicKey[0] !== 0x04)) {
            throw new Error('Invalid public key length');
        }

        return new EthereumAddress(publicKey);
    }

    /**
     * Validate an Ethereum address string to a public key representation
     * @param {string} addressString - The Ethereum address string
     * @returns {Object} Object (isValid) if valid, otherwise throws an error
     * @throws {Error} If the address is invalid
     */
    static validateAddress(addressString) {
        if (!addressString || typeof addressString !== 'string') {
            throw new Error('Invalid address: must be a non-empty string');
        }

        // Validate Ethereum address format
        if (!/^0x[0-9a-fA-F]{40}$/i.test(addressString)) {
            throw new Error('Invalid Ethereum address format');
        }

        // Verify checksum if it's a mixed-case address
        const hasUppercase = /[A-F]/.test(addressString);
        const hasLowercase = /[a-f]/.test(addressString);
        if (hasUppercase && hasLowercase) {
            const checksumAddress = EthereumAddress.prototype.toChecksumAddress.call(
                null, addressString.toLowerCase()
            );
            if (checksumAddress !== addressString) {
                throw new Error('Invalid Ethereum address checksum');
            }
        }

        // Extract the address bytes (without 0x prefix)
        const addressBytes = new Uint8Array(20);
        const addressHex = addressString.slice(2).toLowerCase();
        for (let i = 0; i < 20; i++) {
            addressBytes[i] = parseInt(addressHex.slice(i * 2, i * 2 + 2), 16);
        }

        return {
            isValid: true
        };
    }

    /**
     * Get the public key hash
     * @returns {Uint8Array} The public key hash
     */
    getPubKeyHash() {
        // For Ethereum addresses:
        // 1. Take the Keccak-256 hash of the uncompressed public key
        // 2. Take the last 20 bytes of the hash
        const hash = keccak256(this._publicKey);
        return hash.slice(-20);
    }

    /**
     * Convert the address to a string
     * @returns {string} The address string
     */
    toString() {
        const address = this.getPubKeyHash();
        // Convert to checksum address
        const addressHex = new Uint8Array(address).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        return this.toChecksumAddress(addressHex);
    }

    /**
     * Convert the address to a checksum address
     * @param {string} address - The address to convert
     * @returns {string} The checksum address
     */
    toChecksumAddress(address) {
        // Remove 0x prefix if present
        address = address.toLowerCase().replace('0x', '');
        
        // Get the hash of the address string
        // const hash = Buffer.from(keccak256(Buffer.from(address))).toString('hex');
        const addressBytes = new TextEncoder().encode(address);
        const hash = keccak256(addressBytes);
        const hashArray = new Uint8Array(hash).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        // const hash = new Uint8Array(keccak256(addressBytes)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        let ret = '0x';
        
        // Apply checksum rules
        for (let i = 0; i < address.length; i++) {
            if (parseInt(hashArray[i], 16) >= 8) {
                ret += address[i].toUpperCase();
            } else {
                ret += address[i];
            }
        }
        return ret;
    }

    /**
     * Validate the address
     * @returns {boolean} Whether the address is valid
     */
    validate() {
        try {
            const address = this.toString();
            // Check if it's a valid Ethereum address format
            if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
                return false;
            }
            // Verify checksum if it's a mixed-case address
            if (/[A-F]/.test(address) || /[a-f]/.test(address)) {
                return address === this.toChecksumAddress(address.toLowerCase());
            }
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default EthereumAddress; 