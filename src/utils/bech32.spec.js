import { describe, it, expect } from '@scintilla-network/litest';
import { bech32, bech32m } from './bech32.js';

describe('bech32', () => {
    describe('bech32', () => {
        it('should encode and decode', () => {
            const prefix = 'sct';
            const words = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            
            const encoded = bech32.encode(prefix, words);
            expect(encoded).toBe('sct1qpzry9x8gf2tvyvdmjl');
            
            const decoded = bech32.decode(encoded);
            expect(decoded.prefix).toBe(prefix);
            expect(decoded.words).toEqual(words);
        });

        it('should throw on invalid checksum', () => {
            expect(() => {
                bech32.decode('sct1qpzry9x8gf2tvyvdmjk');
            }).toThrow('Invalid checksum');
        });

        it('should throw on mixed case', () => {
            expect(() => {
                bech32.decode('Sct1qpzry9x8gf2tvyvdmjl');
            }).toThrow('Mixed-case string');
        });

        it('should convert between words and bytes', () => {
            const bytes = [0, 1, 2, 3, 4];
            const words = bech32.toWords(bytes);
            const convertedBack = bech32.fromWords(words);
            expect(convertedBack).toEqual(bytes);
        });
    });

    describe('bech32m', () => {
        it('should encode and decode', () => {
            const prefix = 'sct';
            const words = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            
            const encoded = bech32m.encode(prefix, words);
            const decoded = bech32m.decode(encoded);
            
            expect(decoded.prefix).toBe(prefix);
            expect(decoded.words).toEqual(words);
        });

        it('should throw on invalid checksum', () => {
            expect(() => {
                bech32m.decode('sct1qypqxpq9qcrss000');
            }).toThrow('Invalid checksum');
        });

        it('should handle unsafe decode', () => {
            const result = bech32m.decodeUnsafe('sct1qypqxpq9qcrss000');
            expect(result).toBeUndefined();
        });
    });
});