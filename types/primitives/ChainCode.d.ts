export declare class ChainCode {
    constructor(code: string | Uint8Array);
    static generate(): ChainCode;
    toBuffer(): Uint8Array;
    toString(): string;
}
