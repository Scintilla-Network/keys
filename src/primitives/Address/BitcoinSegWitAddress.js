import { bech32, hash160 } from '@scintilla-network/hashes/utils';
import IAddress from './IAddress.js';

const NETWORK_PREFIXES = {
    mainnet: 'bc',
    testnet: 'tb'
};

class BitcoinSegWitAddress extends IAddress {
    constructor(publicKey, network = 'mainnet') {
        super(publicKey);
        this.network = network;

        if (!(network in NETWORK_PREFIXES)) {
            throw new Error(`Invalid network: ${network}`);
        }
        this.prefix = NETWORK_PREFIXES[network];
        this.witnessVersion = 0; // P2WPKH
    }

    /**
     * Create a Bitcoin SegWit address from a public key
     * @param {Uint8Array} publicKey - The public key to create the address from
     * @param {string} [network='mainnet'] - The network to create the address for
     * @returns {BitcoinSegWitAddress} The Bitcoin SegWit address
     */
    static fromPublicKey(publicKey, network = 'mainnet') {
        return new BitcoinSegWitAddress(publicKey, network);
    }

    /**
     * Validate a Bitcoin SegWit address
     * @param {string} addressString - The SegWit address to decode
     * @returns {Object} Object containing the decoded information (isValid, network, witnessVersion)
     * @throws {Error} If the address is invalid
     */
    static validateAddress(addressString) {
        if (!addressString || typeof addressString !== 'string') {
            throw new Error('Invalid address: must be a non-empty string');
        }

        try {
            // Decode the bech32 address
            const decoded = bech32.decode(addressString);
            
            // Get the network from the prefix
            let network;
            const reversePrefixMap = Object.entries(NETWORK_PREFIXES).reduce((acc, [key, val]) => {
                acc[val] = key;
                return acc;
            }, {});
            
            if (!reversePrefixMap[decoded.prefix]) {
                throw new Error(`Unrecognized SegWit address prefix: ${decoded.prefix}`);
            }
            
            network = reversePrefixMap[decoded.prefix];
            
            // Check witness version
            const witnessVersion = decoded.words[0];
            if (witnessVersion !== 0) {
                throw new Error(`Unsupported witness version: ${witnessVersion}`);
            }
            
            // Get the witness program (pubkey hash)
            const witnessProgram = bech32.fromWords(decoded.words.slice(1));
            
            // For P2WPKH we expect a 20-byte program
            if (witnessProgram.length !== 20) {
                throw new Error(`Invalid witness program length for P2WPKH: ${witnessProgram.length}`);
            }
            
            return {
                isValid: true,
                network: network,
                witnessVersion: witnessVersion
            };
        } catch (error) {
            throw new Error(`Invalid SegWit address: ${error.message}`);
        }
    }

    /**
     * Get the public key hash
     * @returns {Uint8Array} The public key hash
     */
    getPubKeyHash() {
        // For SegWit, we need to ensure we're using compressed public keys
        // The public key should already be in compressed format (33 bytes)
        if (this._publicKey.length !== 33) {
            throw new Error('SegWit requires compressed public keys (33 bytes)');
        }
        return hash160(this._publicKey);
    }

    /**
     * Get the witness program
     * @returns {Uint8Array} The witness program
     */
    getWitnessProgram() {
        const pubKeyHash = this.getPubKeyHash();
        const program = new Uint8Array(pubKeyHash.length + 1);
        program[0] = this.witnessVersion;
        program.set(pubKeyHash, 1);
        return program;
    }

    /**
     * Convert the address to a string
     * @returns {string} The address string
     */
    toString() {
        const pubKeyHash = this.getPubKeyHash();
        // For SegWit v0, the witness program must be exactly 20 bytes (P2WPKH)
        if (pubKeyHash.length !== 20) {
            throw new Error('Invalid pubkey hash length for P2WPKH');
        }
        
        // For P2WPKH:
        // 1. Convert witness version to 5-bit word
        const versionWord = [this.witnessVersion];
        
        // 2. Convert pubkey hash to 5-bit words
        const programWords = bech32.toWords(pubKeyHash);
        
        // 3. Combine version and program words
        const words = [...versionWord, ...programWords];
        
        // 4. Encode with proper HRP (bc for mainnet, tb for testnet)
        return bech32.encode(this.prefix, words);
    }

    /**
     * Validate the address
     * @returns {boolean} Whether the address is valid
     */
    validate() {
        try {
            const address = this.toString();
            const decoded = bech32.decode(address);
            
            // Check if the prefix is a valid network prefix
            const validPrefixes = Object.values(NETWORK_PREFIXES);
            if (!validPrefixes.includes(decoded.prefix)) {
                return false;
            }

            // Check if the prefix matches the expected network
            if (decoded.prefix !== this.prefix) {
                return false;
            }

            // First word is the witness version
            if (decoded.words[0] !== this.witnessVersion) {
                return false;
            }

            // Convert remaining words back to bytes (program)
            const program = bech32.fromWords(decoded.words.slice(1));
            
            // For P2WPKH:
            // - program must be exactly 20 bytes (pubkey hash)
            return program.length === 20;
        } catch (error) {
            return false;
        }
    }
}

export default BitcoinSegWitAddress; 