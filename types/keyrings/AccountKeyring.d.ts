import { ExtendedPrivateKey } from '../primitives/ExtendedPrivateKey';
import { Keyring } from '../primitives/Keyring';
import { AddressKeyring } from './AddressKeyring';
import { PersonaKeyring } from './PersonaKeyring';
import { SharedPersonaKeyring } from './SharedPersonaKeyring';

export declare class AccountKeyring extends Keyring {
    constructor(extendedKey: ExtendedPrivateKey);
    getAddressKeyring(index?: number, change?: number, options?: object): AddressKeyring;
    getPersonaKeyring(moniker: string): PersonaKeyring;
    getSharedPersonaKeyring(moniker1: string, moniker2: string): SharedPersonaKeyring;
}
