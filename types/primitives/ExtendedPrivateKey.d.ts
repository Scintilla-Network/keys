import { PrivateKey } from './PrivateKey';
import { PublicKey } from './PublicKey';
import { ChainCode } from './ChainCode';
import { ExtendedKey } from './ExtendedKey';
import { ExtendedPublicKey } from './ExtendedPublicKey';

export declare class ExtendedPrivateKey extends ExtendedKey {
    constructor(privateKey: PrivateKey, chainCode: ChainCode, depth?: number, parentFingerprint?: number, index?: number);
    static fromSeed(seed: Uint8Array): ExtendedPrivateKey;
    static fromBase58(extendedKeyString: string | Uint8Array): ExtendedPrivateKey;
    static fromHex(extendedKeyHex: string | Uint8Array): ExtendedPrivateKey;
    derive(path: string | number): ExtendedPrivateKey;
    deriveChild(index: number): ExtendedPrivateKey;
    getExtendedPublicKey(): ExtendedPublicKey;
    getPrivateKey(): PrivateKey;
    getPublicKey(): PublicKey;
    getFingerprint(): number;
    getEncodedExtendedKey(): string;
    serialize(): Uint8Array;
    toBase58(): string;
    toBuffer(): Uint8Array;
}
