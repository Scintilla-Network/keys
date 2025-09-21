import Keyring from "../../primitives/Keyring/Keyring.js";
import AccountKeyring from "../AccountKeyring/AccountKeyring.js";

class ChainKeyring extends Keyring {
    /**
     * @description Constructor for the ChainKeyring class
     * @param {ExtendedPrivateKey} extendedKey - Already derived extended private key
     * @param {Object} [options]
     */
    constructor(extendedKey, options = {}) {
        super(extendedKey);
        if (!extendedKey) {
            throw new Error('Extended key is required');
        }

        const defaultOptions = {
            purpose: 44,  // BIP44 by default
            coinType: 8888,  // Scintilla by default
        };

        this.options = { ...defaultOptions, ...options };

        // Store the extended key securely
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

        // Set BIP84 mode if segwit is enabled
        if (this.options.segwit) {
            this._extendedKey.setBIP84Mode(true);
        }
    }
    
    /**
     * @description Get an AccountKeyring instance
     * @param {number} [accountIndex=0] - The account index to derive
     * @returns {AccountKeyring}
     */
    getAccountKeyring(accountIndex = 0) {
        // Construct the derivation path based on BIP44/84
        let path = `m/${accountIndex}'`;
        const derivedKey = this._extendedKey.derive(path);
        return new AccountKeyring(derivedKey);
    }
}

export default ChainKeyring;
