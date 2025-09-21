declare module '@scintilla-network/keys' {
    export class AccountKeyring extends Keyring {
        constructor(extendedKey: ExtendedPrivateKey);
        getAddressKeyring(index?: number, change?: number, options?: object): AddressKeyring;
        getPersonaKeyring(moniker: string): PersonaKeyring;
        getSharedPersonaKeyring(moniker1: string, moniker2: string): SharedPersonaKeyring;
    }
    export class AddressKeyring {
        constructor(key: PublicKey | PrivateKey | ExtendedPrivateKey | ExtendedPublicKey);
        getPublicKey(): PublicKey;
        getPrivateKey(): PrivateKey;
        getAddress(coin?: string): Address;
        isWatchOnly(): boolean;
    }

    export class ChainKeyring extends Keyring {
        constructor(extendedKey: ExtendedPrivateKey, options?: object);
        getAccountKeyring(accountIndex?: number): AccountKeyring;
    }

    export class PersonaKeyring {
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

    export class SeedKeyring extends Keyring {
        constructor(extendedKey: ExtendedPrivateKey);
        static fromMnemonic(mnemonic: string, passphrase?: string, wordlistLanguage?: string): SeedKeyring;
        static fromMnemonicToSeed(mnemonic: string, passphrase?: string, wordlistLanguage?: string): Buffer;
        static fromSeed(seed: Buffer): SeedKeyring;
        getChainKeyring(options?: object): ChainKeyring;
    }
    export class SharedPersonaKeyring extends Keyring {
        constructor(extendedKey: ExtendedPrivateKey, moniker1: string, moniker2: string);
        getMoniker(): string;
        isSharedPersona(): boolean;
        getSharedWithMoniker(): string | null;
        getPersonaTypedKey(type?: string): ExtendedPrivateKey | ExtendedPublicKey;
        getAddressKeyring(index?: number, options?: object): AddressKeyring;
        static fromExtendedPublicKey(extendedPublicKey: ExtendedPublicKey, moniker: string, sharedWithMoniker?: string | null): SharedPersonaKeyring;
    }

    export class Address {  
        constructor(publicKey: Uint8Array | PublicKey, prefix?: string, type?: string, options?: object);
        toString(): string;
        validate(): boolean;
        getType(): string;
        getAddressInstance(): IAddress;
        static fromPublicKey(publicKey: Uint8Array | PublicKey, prefix?: string, type?: string, options?: object): Address;
        static fromString(addressString: string, type?: string): Address;
        static fromStringAutoDetect(addressString: string): Address;
    }
    export interface IAddress {
        getPublicKey(): PublicKey;
        toString(): string;
        validate(): boolean;
    }
    export class ChainCode {
        constructor(code: string | Uint8Array | Buffer);
        static generate(): ChainCode;
        toBuffer(): Uint8Array;
        toString(): string;
    }
    export class ExtendedKey {
        constructor(chainCode: ChainCode | string | Uint8Array, depth?: number, parentFingerprint?: number, index?: number);
        depth: number;
        parentFingerprint: number;
        index: number;
        chainCode: ChainCode;
        setBIP84Mode(enabled: boolean): ExtendedKey;
        serialize(version: number, key: Uint8Array): Uint8Array;
    }
    export class ExtendedPrivateKey extends ExtendedKey {
        constructor(privateKey: PrivateKey, chainCode: ChainCode, depth?: number, parentFingerprint?: number, index?: number);
        static fromSeed(seed: Uint8Array | Buffer): ExtendedPrivateKey;
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
    export class ExtendedPublicKey extends ExtendedKey {
        constructor(publicKey: PublicKey, chainCode: ChainCode, depth?: number, parentFingerprint?: number, index?: number);
        static fromExtendedPrivateKey(extendedPrivateKey: ExtendedPrivateKey): ExtendedPublicKey;
        derive(path: string | number): ExtendedPublicKey;
        deriveChild(index: number): ExtendedPublicKey;
        getPublicKey(): PublicKey;
        getExtendedKey(): Uint8Array;
        getFingerprint(): number;
        getEncodedExtendedKey(): string;
        serialize(): string;
        toString(): string;
        toBase58(): string;
    }
    export class Keyring {
        constructor(extendedKey: ExtendedPrivateKey | ExtendedPublicKey);
        getPublicKey(): PublicKey;
        getPrivateKey(): PrivateKey;
        getExtendedPrivateKey(): ExtendedPrivateKey;
        getExtendedPublicKey(): ExtendedPublicKey;
        isWatchOnly(): boolean;
        secure(): Keyring;
        toBase58(): string;
    }
    export class PrivateKey {
        constructor(key: string | Uint8Array | Buffer);
        static fromWIF(wif: string): PrivateKey;
        getKey(): Uint8Array;
        getPublicKey(): PublicKey;
        serialize(): Uint8Array;
        toHexString(): string;
        toWIF(version?: number): string;
        toString(): string;
    }
    export class PublicKey {
        constructor(key: Uint8Array);
        getKey(): Uint8Array;
        toHexString(): string;
        toString(): string;
    }

    export class SignableMessage {
        constructor(message: string | Buffer);
        toHex(): string;
        sign(signer: Signer, options?: object): [string, string];
        verify(signature: string, publicKey: string, options?: object): boolean;
        encrypt(signer: Signer, options?: object): string;
        decrypt(encryptedMessage: string, signer: Signer, options?: object): string;
    }
    export class Signer {
        static ALGORITHMS: {
            SECP256K1: string;
        };
        constructor(key: PrivateKey | ExtendedPrivateKey | AddressKeyring, moniker?: string | null);
        get privateKey(): Uint8Array;
        getPublicKey(): PublicKey;
        sign(message: SignableMessage, options?: object): [string, string];
        toAddress(): string;
        getMoniker(): string | null;
        verify(message: SignableMessage, signature: string, publicKey: string, options?: object): boolean;
        encrypt(message: SignableMessage, options?: object): string;
        decrypt(encryptedMessage: string, options?: object): string;
    }

    export interface Utils {
        bech32: {
            encode(prefix: string, words: number[], limit?: number): string;
            decode(str: string, limit?: number): {prefix: string, words: number[]};
            decodeUnsafe(str: string, limit?: number): {prefix: string, words: number[]} | undefined;
            toWords(bytes: number[]): number[];
            fromWords(words: number[]): number[];
            fromWordsUnsafe(words: number[]): number[] | undefined;
        };
        bech32m: {
            encode(prefix: string, words: number[], limit?: number): string;
            decode(str: string, limit?: number): {prefix: string, words: number[]};
            decodeUnsafe(str: string, limit?: number): {prefix: string, words: number[]} | undefined;
            toWords(bytes: number[]): number[];
            fromWords(words: number[]): number[];
            fromWordsUnsafe(words: number[]): number[] | undefined;
        };
        escapeHTML(str: string): string;
        unescapeHTML(str: string): string;
        sortObjectByKey(obj: any): any;
        sortedJsonByKeyStringify(obj: any): string;
        makeADR36Doc(message: any, publicKey: string): object;
    }

    export const utils: Utils;
}
