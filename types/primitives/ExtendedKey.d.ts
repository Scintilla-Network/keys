import { ChainCode } from './ChainCode';

export declare class ExtendedKey {
    constructor(chainCode: ChainCode | string | Uint8Array, depth?: number, parentFingerprint?: number, index?: number);
    depth: number;
    parentFingerprint: number;
    index: number;
    chainCode: ChainCode;
    setBIP84Mode(enabled: boolean): ExtendedKey;
    serialize(version: number, key: Uint8Array): Uint8Array;
}
