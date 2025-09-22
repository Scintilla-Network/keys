import { ExtendedPrivateKey } from '../primitives/ExtendedPrivateKey';
import { Keyring } from '../primitives/Keyring';
import { AccountKeyring } from './AccountKeyring';

export declare class ChainKeyring extends Keyring {
    constructor(extendedKey: ExtendedPrivateKey, options?: object);
    getAccountKeyring(accountIndex?: number): AccountKeyring;
}
