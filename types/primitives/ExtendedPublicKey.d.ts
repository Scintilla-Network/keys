import { PublicKey } from './PublicKey';
import { ChainCode } from './ChainCode';
import { ExtendedKey } from './ExtendedKey';
import { ExtendedPrivateKey } from './ExtendedPrivateKey';

export declare class ExtendedPublicKey extends ExtendedKey {
    constructor(publicKey: PublicKey, chainCode: ChainCode, depth?: number, parentFingerprint?: number, index?: number);
    static fromExtendedPrivateKey(extendedPrivateKey: ExtendedPrivateKey): ExtendedPublicKey;
    derive(path: string | number): ExtendedPublicKey;
    deriveChild(index: number): ExtendedPublicKey;
    getPublicKey(): PublicKey;
    getExtendedKey(): Uint8Array;
    getFingerprint(): number;
    getEncodedExtendedKey(): string;
    serialize(): Uint8Array;
    toString(): string;
    toBase58(): string;
}
