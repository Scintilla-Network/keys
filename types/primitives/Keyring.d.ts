import { ExtendedPrivateKey } from './ExtendedPrivateKey';
import { ExtendedPublicKey } from './ExtendedPublicKey';
import { PublicKey } from './PublicKey';
import { PrivateKey } from './PrivateKey';

export declare class Keyring {
    constructor(extendedKey: ExtendedPrivateKey | ExtendedPublicKey);
    getPublicKey(): PublicKey;
    getPrivateKey(): PrivateKey;
    getExtendedPrivateKey(): ExtendedPrivateKey;
    getExtendedPublicKey(): ExtendedPublicKey;
    isWatchOnly(): boolean;
    secure(): Keyring;
    toBase58(): string;
}
