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
    hex: {
        isHex(input: string | Uint8Array | ArrayBuffer): boolean;
        toUint8Array(input: string | Uint8Array | ArrayBuffer): Uint8Array;
        fromUint8Array(input: string | Uint8Array | ArrayBuffer): string;
        toString(input: string): string;
    };
    json: {
        stringify(obj: any): string;
        parse(str: string, options?: { shouldBigInt?: boolean; shouldUint8Array?: boolean }): any;
        sortObjectByKey(obj: any): any;
        sortedJsonByKeyStringify(obj: any): string;
    };
    moniker: {
        validate(moniker: string): boolean;
        deriveSharedMonikerPath(moniker1: string, moniker2: string, hardened?: boolean): { path: string; moniker1AsNumber: number; moniker2AsNumber: number; truncatedHash: Uint8Array; fullHash: Uint8Array };
        deriveMonikerPath(moniker: string, hardened?: boolean): { path: string; monikerAsNumber: number; checksumAsNumber: number; truncatedHash: Uint8Array; fullHash: Uint8Array };
    };
    uint8array: {
        toHex(arr: Uint8Array): string;
        fromHex(hex: string): Uint8Array;
        fromObject(obj: any): Uint8Array;
        toObject(arr: Uint8Array): any;
        fromString(str: string): Uint8Array;
        toString(arr: Uint8Array): string;
    };
    utf8: {
        toHex(str: string): string;
        toUint8Array(str: string): Uint8Array;
        fromHex(hex: string): string;
        fromUint8Array(uint8Array: Uint8Array): string;
        isUtf8(input: string | Uint8Array | ArrayBuffer): boolean;
    };
    varint: {
        encodeVarInt(num: number | bigint, format?: 'hex' | 'uint8array'): string | Uint8Array;
        decodeVarInt(input: Uint8Array | string): { value: number | bigint; length: number };
        getEncodingLength(num: number | bigint): number;
        canEncode(num: number | bigint): boolean;
    };
    varbigint: {
        encodeVarBigInt(num: bigint, format?: 'hex' | 'uint8array'): string | Uint8Array;
        decodeVarBigInt(input: Uint8Array | string): { value: bigint; length: number };
        getEncodingLength(num: bigint): number;
        canEncode(num: bigint): boolean;
    };
}
