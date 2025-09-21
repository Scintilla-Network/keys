import IAddress from './IAddress.js';

// Import all available address implementations
import ScintillaAddress from './ScintillaAddress.js';
import EthereumAddress from './EthereumAddress.js';
import BitcoinSegWitAddress from './BitcoinSegWitAddress.js';
import BitcoinLegacyAddress from './BitcoinLegacyAddress.js';
import CosmosAddress from './CosmosAddress.js';

/**
 * Factory class for creating addresses of different types
 */
class Address extends IAddress {
    /**
     * Create an address instance based on the public key and type
     * 
     * @param {Uint8Array|Object} publicKey - Public key as Uint8Array or an object with getKey method
     * @param {string|null} [prefix='sct'] - Address prefix (for Scintilla/Cosmos) or network (for Bitcoin)
     * @param {string} [type='scintilla'] - Address type (scintilla, ethereum, bitcoin-segwit, bitcoin-legacy, cosmos)
     * @param {Object} [options={}] - Additional options specific to the address type
     */
    constructor(publicKey, prefix = 'sct', type = 'scintilla', options = {}) {
        // Initialize parent with the public key
        super(publicKey);
        
        // Store the address type and options
        this._type = type.toLowerCase();
        this._prefix = prefix;
        this._options = options;
        
        // Create the specific address instance based on type
        this._addressInstance = this._createAddressInstance();
    }
    
    /**
     * Create the specific address instance based on the type
     * @private
     * @returns {IAddress} The specific address instance
     */
    _createAddressInstance() {
        switch (this._type) {
            case 'scintilla':
                return new ScintillaAddress(this.getPublicKey(), this._prefix, this._options);
                
            case 'ethereum':
                return new EthereumAddress(this.getPublicKey(), this._options);
                
            case 'bitcoin-segwit': {
                // For Bitcoin SegWit, prefix is used as network ('mainnet' or 'testnet')
                const network = this._prefix || 'mainnet';
                return new BitcoinSegWitAddress(this.getPublicKey(), network, this._options);
            }
                
            case 'bitcoin-legacy': {
                // For Bitcoin Legacy, prefix is used as network ('mainnet' or 'testnet')
                const network = this._prefix || 'mainnet';
                return new BitcoinLegacyAddress(this.getPublicKey(), network, this._options);
            }
                
            case 'cosmos':
                return new CosmosAddress(this.getPublicKey(), this._prefix, this._options);
                
            default:
                throw new Error(`Unsupported address type: ${this._type}`);
        }
    }
    
    /**
     * Get the string representation of the address
     * @returns {string} The address string
     */
    toString() {
        return this._addressInstance.toString();
    }
    
    /**
     * Validate the address
     * @returns {boolean} True if the address is valid
     */
    validate() {
        return this._addressInstance.validate();
    }
    
    /**
     * Get the type of the address
     * @returns {string} The address type
     */
    getType() {
        return this._type;
    }
    
    /**
     * Get the underlying address instance
     * @returns {IAddress} The specific address instance
     */
    getAddressInstance() {
        return this._addressInstance;
    }
    
    /**
     * Create an address from a public key
     * @param {Uint8Array|Object} publicKey - Public key as Uint8Array or an object with getKey method
     * @param {string|null} [prefix='sct'] - Address prefix (for Scintilla/Cosmos) or network (for Bitcoin)
     * @param {string} [type='scintilla'] - Address type
     * @param {Object} [options={}] - Additional options
     * @returns {Address} Address instance
     */
    static fromPublicKey(publicKey, prefix = 'sct', type = 'scintilla', options = {}) {
        return new Address(publicKey, prefix, type, options);
    }
    
    /**
     * Create an address from a string representation
     * @param {string} addressString - Address string
     * @param {string} [type='scintilla'] - Address type to use for decoding
     * @returns {Address} Address instance
     */
    static fromString(addressString, type = 'scintilla') {
        let publicKey, prefix, options = {}, network;
        
        switch (type.toLowerCase()) {
            case 'scintilla':
                ({ publicKey, prefix } = ScintillaAddress.decodeAddress(addressString));
                return new Address(publicKey, prefix, type);
                
            case 'ethereum':
                publicKey = EthereumAddress.decodeAddress(addressString);
                return new Address(publicKey, null, type);
                
            case 'bitcoin-segwit':
                ({ publicKey, network, ...options } = BitcoinSegWitAddress.decodeAddress(addressString));
                return new Address(publicKey, network || 'mainnet', type, options);
                
            case 'bitcoin-legacy':
                ({ publicKey, network } = BitcoinLegacyAddress.decodeAddress(addressString));
                return new Address(publicKey, network || 'mainnet', type);
                
            case 'cosmos':
                ({ publicKey, prefix } = CosmosAddress.decodeAddress(addressString));
                return new Address(publicKey, prefix, type);
                
            default:
                throw new Error(`Unsupported address type for decoding: ${type}`);
        }
    }
    
    /**
     * Auto-detect address type from string and create appropriate address instance
     * @param {string} addressString - Address string to analyze
     * @returns {Address} Address instance of the detected type
     * @throws {Error} If address type cannot be detected or is invalid
     */
    static fromStringAutoDetect(addressString) {
        // Try to detect the address type based on format
        
        // Scintilla addresses use bech32 format with prefix sct
        if (addressString.startsWith('sct1')) {
            return Address.fromString(addressString, 'scintilla');
        }
        
        // Ethereum addresses start with 0x and are 42 chars long
        if (/^0x[0-9a-fA-F]{40}$/.test(addressString)) {
            return Address.fromString(addressString, 'ethereum');
        }
        
        // Bitcoin SegWit addresses typically start with bc1
        if (addressString.startsWith('bc1') || addressString.startsWith('tb1')) {
            return Address.fromString(addressString, 'bitcoin-segwit');
        }
        
        // Bitcoin Legacy addresses typically start with 1 or 3
        if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addressString)) {
            return Address.fromString(addressString, 'bitcoin-legacy');
        }
        
        // Cosmos addresses use bech32 format, typically with prefix cosmos, osmo, etc.
        if (/^[a-z]{1,20}1[a-z0-9]{38,58}$/.test(addressString)) {
            return Address.fromString(addressString, 'cosmos');
        }
        
        throw new Error(`Could not auto-detect address type for: ${addressString}`);
    }
}

export default Address; 