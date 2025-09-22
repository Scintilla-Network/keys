import { ExtendedPrivateKey } from '../primitives/ExtendedPrivateKey';
import { ExtendedPublicKey } from '../primitives/ExtendedPublicKey';
import { PublicKey } from '../primitives/PublicKey';
import { PrivateKey } from '../primitives/PrivateKey';
import { AddressKeyring } from './AddressKeyring';

export declare class PersonaKeyring {
    constructor(extendedKey: ExtendedPrivateKey, moniker: string, sharedWithMoniker?: string | null);
    getPublicKey(): PublicKey;
    getPrivateKey(): PrivateKey;
    getExtendedPublicKey(): ExtendedPublicKey;
    getMoniker(): string;
    isSharedPersona(): boolean;
    getSharedWithMoniker(): string | null;
    isWatchOnly(): boolean;
    getPersonaTypedKey(type?: string): ExtendedPrivateKey | ExtendedPublicKey;
    getAddressKeyring(index?: number, options?: object): AddressKeyring;
    secure(): PersonaKeyring;
}
