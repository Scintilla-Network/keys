import AddressKeyring from "../AddressKeyring/AddressKeyring.js";
import { deriveMonikerPath, validateMoniker } from "../../utils/monikerUtils.js";

class PersonaKeyring {
    /**
     * Create a PersonaKeyring instance
     * @param {ExtendedPrivateKey} extendedKey - The extended private key
     * @param {string} moniker - The moniker of the persona
     * @param {string} sharedWithMoniker - The moniker of the shared persona
     */
    constructor(extendedKey, moniker, sharedWithMoniker = null) {
        if (!extendedKey) {
            throw new Error('Extended key is required');
        }
        if (!moniker) {
            throw new Error('Moniker is required');
        }

        validateMoniker(moniker);
        
        // Store moniker info
        Object.defineProperty(this, '_moniker', {
            value: moniker,
            enumerable: false,
            writable: false,
            configurable: false
        });

        // Handle shared persona case
        if (sharedWithMoniker) {
            validateMoniker(sharedWithMoniker);
            Object.defineProperty(this, '_sharedWithMoniker', {
                value: sharedWithMoniker,
                enumerable: false,
                writable: false,
                configurable: false
            });

            // Sort monikers alphabetically for consistent derivation
            const [moniker1, moniker2] = [moniker, sharedWithMoniker].sort();
            const combinedMoniker = `${moniker1}:${moniker2}`;
            const { path } = deriveMonikerPath(combinedMoniker, false);
            this._derivationPath = path;
        } else {
            // Personal persona case
            const { path } = deriveMonikerPath(moniker, false);
            this._derivationPath = path;
        }

        // Derive the base persona key according to SIP-1111
        // const purposePath = "m/1111'/8888'/0'"; // SIP-1111 purpose and coin_type for Scintilla
        const derivationPath = this._derivationPath;
        const personaBaseKey = extendedKey.derive(derivationPath);

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
     * Get the extended public key
     * @returns {ExtendedPublicKey} The extended public key
     */
    getExtendedPublicKey() {
        return this._personaKey.getExtendedPublicKey();
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
     * Check if the persona is watch only
     * @returns {boolean} Whether the persona is watch only
     */
    isWatchOnly() {
        return !this._privateKey;
    }

    /**
     * Get a persona typed key
     * @param {string} type - The type of persona key to get
     * @returns {ExtendedPrivateKey|ExtendedPublicKey} The persona typed key
     */
    getPersonaTypedKey(type = 'default') {
        let path = 'm';  // Start from the persona base

        // specific derivation paths for different persona types as per SIP-1111
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
            case 'public':
                path = 'm/5';
                break;
            case 'owner':
            case 'spender':
            case 'default':
                // Use base path directly
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
     * @param {Object} _options - The options for the address derivation
     * @returns {AddressKeyring} The address keyring
     */
    getAddressKeyring(index = 0, _options) {
        const options = {
            change: 0,
            type: 'default',
            ..._options
        }
        const personaKey = this.getPersonaTypedKey(options.type);
        // Follow BIP44 style derivation for change and index
        const path = `m/${options.change}/${index}`;
        const derivedKey = personaKey.derive(path);
        
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

    /**
     * Secure the persona keyring
     * @returns {PersonaKeyring} The persona keyring
     */
    secure() {
        delete this._privateKey;
        return this;
    }
}

export default PersonaKeyring;