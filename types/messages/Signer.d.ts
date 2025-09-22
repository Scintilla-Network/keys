import { PrivateKey } from '../primitives/PrivateKey';
import { PublicKey } from '../primitives/PublicKey';
import { ExtendedPrivateKey } from '../primitives/ExtendedPrivateKey';
import { AddressKeyring } from '../keyrings/AddressKeyring';
import { SignableMessage } from './SignableMessage';

export declare class Signer {
    static ALGORITHMS: {
        SECP256K1: string;
    };
    static CIPHERS: {
        XCHACHA20: string;
    };
    constructor(key: PrivateKey | ExtendedPrivateKey | AddressKeyring | PublicKey | Uint8Array, moniker?: string | null);
    static fromPublicKey(publicKey: PublicKey, moniker?: string | null): Signer;
    get privateKey(): Uint8Array;
    getPublicKey(): PublicKey;
    sign(message: SignableMessage, options?: object): [string, string];
    toAddress(): string;
    getMoniker(): string | null;
    verify(message: SignableMessage, signature: string, publicKey: string, options?: object): boolean;
    encrypt(message: SignableMessage, options?: object): string;
    decrypt(encryptedMessage: string, options?: object): string;
}
