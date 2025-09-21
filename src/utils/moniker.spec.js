import { describe, it, expect } from '@scintilla-network/litest';
import moniker from './moniker.js';

describe('moniker', () => {
    describe('validate', () => {
        it('should validate a moniker', () => {
            expect(moniker.validate('sct.alice')).toBe(true);
        });
        it('should throw an error if the moniker is not a string', () => {
            expect(() => moniker.validate(123)).toThrow('Moniker must be a string');
        });
        it('should throw an error if the moniker is empty', () => {
            expect(() => moniker.validate('')).toThrow('Moniker cannot be empty');
        });
    });

    describe('deriveSharedMonikerPath', () => {
        it('should derive a shared moniker path', () => {
            expect(moniker.deriveSharedMonikerPath('sct.alice', 'sct.bob')).toEqual({
                path: "m/2'/7971736'/11852131'",
                moniker1AsNumber: 7971736,
                moniker2AsNumber: 11852131,
                truncatedHash: new Uint8Array([121, 163, 152, 180, 217, 99]),
                fullHash: new Uint8Array([
                    121, 163, 152, 180, 217, 99, 51, 24, 60, 34, 109, 115,
                    173, 55, 43, 166, 139, 74, 31, 49, 48, 1, 251, 195,
                    214, 82, 216, 12, 27, 33, 154, 86
                ])
            });
        });
    });
    describe('deriveMonikerPath', () => {   
        it('should derive a moniker path', () => {
            expect(moniker.deriveMonikerPath('sct.alice')).toEqual({
                path: "m/2'/1387663315'/1787011306'",
                monikerAsNumber: 1387663315,
                checksumAsNumber: 1787011306,
                truncatedHash: new Uint8Array([
                    165,
                    108,
                    31,
                    213,
                    7,
                    65
                ]),
                fullHash: new Uint8Array([
                    165,
                    108,
                    31,
                    213,
                    7,
                    65,
                    165,
                    4,
                    219,
                    189,
                    243,
                    73,
                    193,
                    236,
                    242,
                    43,
                    214,
                    17,
                    76,
                    236,
                    142,
                    43,
                    138,
                    254,
                    168,
                    226,
                    235,
                    239,
                    195,
                    7,
                    28,
                    202
                ])
            });
        });
    });
});