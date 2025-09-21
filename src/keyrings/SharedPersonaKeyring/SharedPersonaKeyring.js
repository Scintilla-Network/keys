import AddressKeyring from "../AddressKeyring/AddressKeyring.js";
import Keyring from "../../primitives/Keyring/Keyring.js";

import { validateMoniker, deriveSharedMonikerPath } from "../../utils/monikerUtils.js";

class SharedPersonaKeyring extends Keyring {
    /**
     * @description Constructor for the SharedPersonaKeyring class
     * @param {ExtendedPrivateKey} extendedKey - Already derived extended private key
     * @param {string} moniker1 - The moniker of the first persona
     * @param {string} moniker2 - The moniker of the second persona
     */
    constructor(extendedKey, _moniker1, _moniker2) {
        super(extendedKey);
        if (!extendedKey) {
            throw new Error('Extended key is required');
        }
        if (!_moniker1 || !_moniker2) {
            throw new Error('Monikers are required');
        }

        validateMoniker(_moniker1);
        validateMoniker(_moniker2);
        
        // Store moniker info
        Object.defineProperty(this, '_moniker1', {
            value: _moniker1,
            enumerable: false,
            writable: false,
            configurable: false
        });
        Object.defineProperty(this, '_moniker2', {
            value: _moniker2,
            enumerable: false,
            writable: false,
            configurable: false
        });
        
       
        // Sort monikers alphabetically for consistent derivation
        const [lowerMoniker, higherMoniker] = [this._moniker1, this._moniker2].sort();
        const { path } = deriveSharedMonikerPath(lowerMoniker, higherMoniker);
        this._derivationPath = path;
        // Derive the base persona key - Note: Using non-hardened derivation
        const personaBaseKey = extendedKey.derive(this._derivationPath);

        Object.defineProperty(this, '_personaKey', {
            value: personaBaseKey,
            enumerable: false,
            writable: false,
            configurable: false
        });

        // Store private key only if available (ExtendedPrivateKey)
        if ('getPrivateKey' in personaBaseKey) {
            this._privateKey = personaBaseKey.getPrivateKey();
        }

        // Public key is always available from either type
        this.publicKey = this._privateKey ? 
            this._privateKey.getPublicKey() : 
            personaBaseKey.getPublicKey();
    }

    /**
     * Get the moniker
     * @returns {string} The moniker
     */
    getMoniker() {
        return this._moniker;
    }

    /**
     * Check if the persona is shared
     * @returns {boolean} Whether the persona is shared
     */
    isSharedPersona() {
        return !!this._sharedWithMoniker;
    }

    /**
     * Get the shared with moniker
     * @returns {string} The shared with moniker
     */
    getSharedWithMoniker() {
        return this._sharedWithMoniker;
    }

    /**
     * Get a persona typed key
     * @param {string} type - The type of persona key to get
     * @returns {ExtendedPrivateKey|ExtendedPublicKey} The persona typed key
     */
    getPersonaTypedKey(type = 'default') {
        let path = 'm';  // Start from the persona base

        // Add specific derivation paths for different persona types
        // Note: Using non-hardened derivation for shared access
        switch (type.toLowerCase()) {
            case 'proposer':
                path = 'm/1';
                break;
            case 'voter':
                path = 'm/2';
                break;
            case 'stake':
                path = 'm/3';
                break;
            case 'operator':
                path = 'm/4';
                break;
            case 'owner':
            case 'spender':
            case 'default':
                path = 'm/0';
                break;
            default:
                throw new Error('Invalid persona type');
        }
        
        const derivedKey = this._personaKey.derive(path);
        if (this._privateKey) {
            return derivedKey;
        } else {
            return derivedKey.getExtendedPublicKey();
        }
    }

    /**
     * Get an AddressKeyring instance
     * @param {number} index - The index to derive the address for
     * @param {Object} options - The options for the address derivation
     * @returns {AddressKeyring} The address keyring
     */
    getAddressKeyring(index = 0, options = {
        change: 0,
        type: 'default'
    }) {
        // Use non-hardened derivation for change and index
        const path = `m/${options.change}/${index}`;
        const derivedKey = this._personaKey.derive(path);
        
        if (this._privateKey) {
            // We have private key access
            const privateKey = derivedKey.getPrivateKey();
            return new AddressKeyring(privateKey, options);
        } else {
            // Watch-only - pass public key
            const publicKey = derivedKey.getPublicKey();
            return new AddressKeyring(publicKey, options);
        }
    }

    // Static helper for creating a shared keyring from another user's extended public key
    /**
     * Create a SharedPersonaKeyring instance from an extended public key
     * @param {ExtendedPublicKey} extendedPublicKey - The extended public key
     * @param {string} moniker - The moniker of the persona
     * @param {string} sharedWithMoniker - The moniker of the shared persona
     * @returns {SharedPersonaKeyring} The shared persona keyring
     */
    static fromExtendedPublicKey(extendedPublicKey, moniker, sharedWithMoniker = null) {
        return new SharedPersonaKeyring(extendedPublicKey, moniker, sharedWithMoniker);
    }
}

export default SharedPersonaKeyring; 