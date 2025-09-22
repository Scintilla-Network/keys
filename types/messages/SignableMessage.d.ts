import { Signer } from './Signer';

export declare class SignableMessage {
    static ALGORITHMS: {
        SECP256K1: string;
    };
    static CIPHERS: {
        XCHACHA20: string;
    };
    static CIPHER_SUPPORTED_FORMATS: {
        bytes: string;
        hex: string;
    };
    static DECIPHER_SUPPORTED_OUTPUTS: {
        bytes: string;
        hex: string;
        utf8: string;
    };
    constructor(input: Uint8Array);
    static fromHex(hex: string): SignableMessage;
    static fromObject(object: any): SignableMessage;
    static fromString(string: string): SignableMessage;
    toHex(): string;
    toUint8Array(): Uint8Array;
    sign(signer: Signer, options?: object): [string, string];
    verify(signature: string, publicKey: string, options?: object): boolean;
    encrypt(signer: Signer, options?: object): string;
    decrypt(encryptedMessage: string, signer: Signer, options?: object): string;
}
