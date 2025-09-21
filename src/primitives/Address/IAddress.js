class IAddress {
    constructor(publicKey) {
        if (this.constructor === IAddress) {
            throw new Error('Address is an abstract class and cannot be instantiated directly');
        }
        this._publicKey = publicKey instanceof Uint8Array ? publicKey : 
                        typeof publicKey?.getKey === 'function' ? publicKey.getKey() : 
                         null;

        if (!(this._publicKey instanceof Uint8Array)) {
            throw new Error('Public key must be a Uint8Array');
        }
    }

    /**
     * Get the public key
     * @returns {Uint8Array} The public key
     */
    getPublicKey() {
        return new Uint8Array(this._publicKey);
    }

    /**
     * Convert the address to a string
     * @returns {string} The address string
     */
    toString() {
        throw new Error('toString() must be implemented by subclasses');
    }

    /**
     * Validate the address
     * @returns {boolean} Whether the address is valid
     */
    validate() {
        throw new Error('validate() must be implemented by subclasses');
    }

    /**
     * Create an address from a public key
     * @param {Uint8Array} publicKey - The public key to create the address from
     * @returns {IAddress} The address
     */
    static fromPublicKey(publicKey) {
        throw new Error('fromPublicKey() must be implemented by subclasses');
    }
}

export default IAddress; 