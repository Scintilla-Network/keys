import { ExtendedPrivateKey } from '../primitives/ExtendedPrivateKey';
import { ExtendedPublicKey } from '../primitives/ExtendedPublicKey';
import { Keyring } from '../primitives/Keyring';
import { AddressKeyring } from './AddressKeyring';

export declare class SharedPersonaKeyring extends Keyring {
    constructor(extendedKey: ExtendedPrivateKey, moniker1: string, moniker2: string);
    getMoniker(): string;
    isSharedPersona(): boolean;
    getSharedWithMoniker(): string | null;
    getPersonaTypedKey(type?: string): ExtendedPrivateKey | ExtendedPublicKey;
    getAddressKeyring(index?: number, options?: object): AddressKeyring;
    static fromExtendedPublicKey(extendedPublicKey: ExtendedPublicKey, moniker1: string, moniker2: string): SharedPersonaKeyring;
}
