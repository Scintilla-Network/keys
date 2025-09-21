import AddressKeyring from "../AddressKeyring/AddressKeyring.js";
import PersonaKeyring from "../PersonaKeyring/PersonaKeyring.js";
import SharedPersonaKeyring from "../SharedPersonaKeyring/SharedPersonaKeyring.js";
import Keyring from "../../primitives/Keyring/Keyring.js";

class AccountKeyring extends Keyring {
    /**
     * @description Constructor for the AccountKeyring class
     * @param {ExtendedPrivateKey} extendedKey - Already derived extended private key
     * @returns {AccountKeyring}
     */
    constructor(extendedKey) {
        super(extendedKey);
        if (!extendedKey) {
            throw new Error('Extended key is required');
        }

        Object.defineProperty(this, '_extendedKey', {
            value: extendedKey,
            enumerable: false,
            writable: false,
            configurable: false
        });

        // Store private key only if available (ExtendedPrivateKey)
        if ('getPrivateKey' in extendedKey) {
            this._privateKey = extendedKey.getPrivateKey();
        }

        // Public key is always available from either type
        this.publicKey = this._privateKey ? 
            this._privateKey.getPublicKey() : 
            extendedKey.getPublicKey();
    }

    /**
     * @description Get an AddressKeyring instance
     * @param {number} [index=0] - The index of the address to derive
     * @param {number} [change=0] - The change of the address to derive
     * @param {Object} [options]
     * @returns {AddressKeyring}
     */
    getAddressKeyring(index = 0, change = 0, options = {}) {
        const path = `m/${change}/${index}`;
        const derivedKey = this._extendedKey.derive(path);
        
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
     * @description Get a PersonaKeyring instance
     * @param {string} moniker - The moniker of the persona
     * @returns {PersonaKeyring}
     */ 
    getPersonaKeyring(moniker) {
        return new PersonaKeyring(this._extendedKey, moniker);
    }

    /**
     * @description Get a SharedPersonaKeyring instance
     * @param {string} moniker1 - The moniker of the first persona
     * @param {string} moniker2 - The moniker of the second persona
     * @returns {SharedPersonaKeyring}
     */ 
    getSharedPersonaKeyring(moniker1, moniker2) {
        return new SharedPersonaKeyring(this._extendedKey, moniker1, moniker2);
    }
}

export default AccountKeyring;
