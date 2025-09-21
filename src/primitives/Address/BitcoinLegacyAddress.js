import { base58check, hash160 } from '@scintilla-network/hashes/utils';
import IAddress from './IAddress.js';

const NETWORK_VERSIONS = {
    mainnet: 0x00,
    testnet: 0x6f
};

class BitcoinLegacyAddress extends IAddress {
    constructor(publicKey, network = 'mainnet') {
        super(publicKey);
        this.network = network;

        if (!(network in NETWORK_VERSIONS)) {
            throw new Error(`Invalid network: ${network}`);
        }
        this.version = NETWORK_VERSIONS[network];
    }

    /**
     * Create a Bitcoin Legacy address from a public key
     * @param {Uint8Array} publicKey - The public key to create the address from
     * @param {string} [network='mainnet'] - The network to create the address for
     * @returns {BitcoinLegacyAddress} The Bitcoin Legacy address
     */
    static fromPublicKey(publicKey, network = 'mainnet') {
        return new BitcoinLegacyAddress(publicKey, network);
    }

    /**
     * Validate a Bitcoin Legacy address
     * @param {string} addressString - The address string to decode
     * @returns {Object} Object (isValid, network) if valid, otherwise throws an error
     * @throws {Error} If the address is invalid
     */
    static validateAddress(addressString) {
        if (!addressString || typeof addressString !== 'string') {
            throw new Error('Invalid address: must be a non-empty string');
        }

        try {
            // Decode the base58check address
            const decoded = base58check.decode(addressString);
            
            // The first byte is the version byte which identifies the network
            const versionByte = decoded[0];
            
            // Get the network from the version byte
            let network;
            const reverseVersionMap = Object.entries(NETWORK_VERSIONS).reduce((acc, [key, val]) => {
                acc[val] = key;
                return acc;
            }, {});
            
            if (!reverseVersionMap[versionByte]) {
                throw new Error(`Unrecognized address version byte: ${versionByte}`);
            }
            
            network = reverseVersionMap[versionByte];
            
            // The rest is the pubkey hash
            const pubKeyHash = decoded.slice(1);
            
            // For P2PKH we expect a 20-byte hash
            if (pubKeyHash.length !== 20) {
                throw new Error(`Invalid pubkey hash length: ${pubKeyHash.length}`);
            }
            
            // Create a placeholder public key that will hash to the same value
            // Note: We can't recover the original public key from a hash
            const placeholderKey = new Uint8Array(33);
            placeholderKey[0] = 0x02; // Compressed public key marker
            placeholderKey.set(pubKeyHash, 1);
            
            return {
                isValid: true,
                network: network
            };
        } catch (error) {
            throw new Error(`Invalid Bitcoin Legacy address: ${error.message}`);
        }
    }

    /**
     * Get the public key hash
     * @returns {Uint8Array} The public key hash
     */
    getPubKeyHash() {
        return hash160(this._publicKey);
    }

    /**
     * Convert the address to a string
     * @returns {string} The address string
     */
    toString() {
        const pubKeyHash = this.getPubKeyHash();
        const versionedHash = new Uint8Array(21);
        versionedHash[0] = this.version;
        versionedHash.set(pubKeyHash, 1);
        return base58check.encode(versionedHash);
    }

    /**
     * Validate the address
     * @returns {boolean} Whether the address is valid
     */
    validate() {
        try {
            const address = this.toString();
            const decoded = base58check.decode(address);
            return decoded[0] === this.version && decoded.length === 21;
        } catch (error) {
            return false;
        }
    }
}

export default BitcoinLegacyAddress; 