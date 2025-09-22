import { PublicKey } from './PublicKey';

export interface IAddress {
    getPublicKey(): PublicKey;
    toString(): string;
    validate(): boolean;
}

export declare class Address {
    constructor(publicKey: Uint8Array | PublicKey, prefix?: string, type?: string, options?: object);
    toString(): string;
    validate(): boolean;
    getType(): string;
    getAddressInstance(): IAddress;
    static fromPublicKey(publicKey: Uint8Array | PublicKey, prefix?: string, type?: string, options?: object): Address;
    static fromString(addressString: string, type?: string): Address;
    static fromStringAutoDetect(addressString: string): Address;
}
