import { PublicKey } from './PublicKey';

export declare class PrivateKey {
    constructor(key: string | Uint8Array);
    static fromWIF(wif: string): PrivateKey;
    getKey(): Uint8Array;
    getPublicKey(): PublicKey;
    serialize(): Uint8Array;
    toHexString(): string;
    toWIF(version?: number): string;
    toString(): string;
}
