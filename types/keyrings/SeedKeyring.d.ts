import { ExtendedPrivateKey } from '../primitives/ExtendedPrivateKey';
import { Keyring } from '../primitives/Keyring';
import { ChainKeyring } from './ChainKeyring';

export declare class SeedKeyring extends Keyring {
    constructor(extendedKey: ExtendedPrivateKey);
    static fromMnemonic(mnemonic: string, passphrase?: string, wordlistLanguage?: string): SeedKeyring;
    static fromMnemonicToSeed(mnemonic: string, passphrase?: string, wordlistLanguage?: string): Uint8Array;
    static fromSeed(seed: Uint8Array): SeedKeyring;
    getChainKeyring(options?: { purpose?: number; coinType?: number; chain?: string }): ChainKeyring;
}
