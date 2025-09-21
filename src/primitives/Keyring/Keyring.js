class Keyring {
    /**
     * @description Constructor for the Keyring class
     * @param {ExtendedPrivateKey} extendedKey
     */
    constructor(extendedKey) {
        if (!extendedKey) {
            throw new Error('Extended key is required');
        }
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
    }

    /**
     * @description Get the public key
     * @returns {PublicKey}
     */
    getPublicKey() {
        return this.publicKey;
    }

    /**
     * @description Get the private key
     * @returns {PrivateKey}
     */
    getPrivateKey() {
        if (!this._privateKey) {
            throw new Error('Private key is not available');
        }
        return this._privateKey;
    }

    /**
     * @description Get the extended private key
     * @returns {ExtendedPrivateKey}
     */
    getExtendedPrivateKey() {
        return this._extendedKey;
    }

    /**
     * @description Get the extended public key
     * @returns {ExtendedPublicKey}
     */
    getExtendedPublicKey() {
        return this._extendedKey.getExtendedPublicKey();
    }

    /**
     * @description Check if the keyring is watch only
     * @returns {boolean}
     */
    isWatchOnly() {
        return !this._privateKey;
    }

    /**
     * @description Secure the keyring by removing the private key
     * @returns {Keyring}
     */
    secure() {
        delete this._privateKey;
        return this;
    }

    /**
     * @description Convert the keyring to a base58 string
     * @returns {string}
     */
    toBase58() {
        return this._extendedKey.toBase58();
    }
}

export default Keyring;
