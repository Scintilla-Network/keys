import { PublicKey } from '../primitives/PublicKey';
import { PrivateKey } from '../primitives/PrivateKey';
import { ExtendedPrivateKey } from '../primitives/ExtendedPrivateKey';
import { ExtendedPublicKey } from '../primitives/ExtendedPublicKey';
import { Address } from '../primitives/Address';

export declare class AddressKeyring {
    constructor(key: PublicKey | PrivateKey | ExtendedPrivateKey | ExtendedPublicKey);
    getPublicKey(): PublicKey;
    getPrivateKey(): PrivateKey;
    getAddress(coin?: string): Address;
    isWatchOnly(): boolean;
}
