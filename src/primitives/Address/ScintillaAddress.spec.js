import { describe, it, expect } from '@scintilla-network/litest';
import ScintillaAddress from './ScintillaAddress.js';
import PublicKey from '../PublicKey/PublicKey.js';
import PrivateKey from '../PrivateKey/PrivateKey.js';
import { bech32 } from '@scintilla-network/hashes/utils';
import ExtendedPrivateKey from '../ExtendedPrivateKey/ExtendedPrivateKey.js';

describe('ScintillaAddress', () => {
    // Test vector from a known public key and its corresponding Scintilla address
    const validPubKeyHex = '037c6b16928e589c84362448ad19a315f350ed4a3dd01f5cb9c7be5a1dcdf533db';
    const validPubKey = new Uint8Array(Buffer.from(validPubKeyHex, 'hex'));
    const expectedSctAddress = 'sct150ctmpchzwgf6ycvuyyl569424ruxf4hlq8vlp';
    const expectedTestAddress = 'tsct150ctmpchzwgf6ycvuyyl569424ruxf4h34wgls';

    // Debug: decode the expected address
    const decoded = bech32.decode(expectedSctAddress);
    const decodedHash = bech32.fromWords(decoded.words);

    describe('constructor', () => {
        it('should create address with valid public key and default prefix', () => {
            const address = new ScintillaAddress(validPubKey);
            expect(address).toBeInstanceOf(ScintillaAddress);
            expect(address.validate()).toBe(true);
            expect(address.prefix).toBe('sct');
        });

        it('should create address with custom prefix', () => {
            const address = new ScintillaAddress(validPubKey, 'tsct');
            expect(address).toBeInstanceOf(ScintillaAddress);
            expect(address.validate()).toBe(true);
            expect(address.prefix).toBe('tsct');
        });

        it('should create address with PublicKey instance', () => {
            const pubKeyInstance = new PublicKey(validPubKey);
            const address = new ScintillaAddress(pubKeyInstance);
            expect(address.validate()).toBe(true);
        });

        it('should throw error if public key is invalid', () => {
            expect(() => new ScintillaAddress('invalid')).toThrow('Public key must be a Uint8Array');
        });
    });

    describe('fromPublicKey', () => {
        it('should create address from public key bytes with default prefix', () => {
            const address = ScintillaAddress.fromPublicKey(validPubKey);
            expect(address).toBeInstanceOf(ScintillaAddress);
            expect(address.validate()).toBe(true);
            expect(address.toString()).toBe(expectedSctAddress);
        });

        it('should create address from public key bytes with custom prefix', () => {
            const address = ScintillaAddress.fromPublicKey(validPubKey, 'tsct');
            expect(address).toBeInstanceOf(ScintillaAddress);
            expect(address.validate()).toBe(true);
            expect(address.toString()).toBe(expectedTestAddress);
        });

        it('should create address from PublicKey instance', () => {
            const pubKeyInstance = new PublicKey(validPubKey);
            const address = ScintillaAddress.fromPublicKey(pubKeyInstance);
            expect(address.validate()).toBe(true);
        });
    });

    describe('getPublicKey', () => {
        it('should return the original public key bytes', () => {
            const address = new ScintillaAddress(validPubKey);
            expect(address.getPublicKey()).toEqual(validPubKey);
        });
    });

    describe('getPubKeyHash', () => {
        it('should return valid hash160 of public key', () => {
            const address = new ScintillaAddress(validPubKey);
            const hash = address.getPubKeyHash();
            expect(hash).toBeInstanceOf(Uint8Array);
            expect(hash.length).toBe(20); // hash160 output is always 20 bytes
        });
    });

    describe('validate', () => {
        it('should return true for valid sct address', () => {
            const address = new ScintillaAddress(validPubKey);
            expect(address.validate()).toBe(true);
        });

        it('should return true for valid test address', () => {
            const address = new ScintillaAddress(validPubKey, 'tsct');
            expect(address.validate()).toBe(true);
        });

        it('should return false for invalid prefix', () => {
            const address = new ScintillaAddress(validPubKey);
            address.prefix = 'invalid!@#';
            expect(address.validate()).toBe(false);
        });

        it('should return false for invalid pubkey hash length', () => {
            const address = new ScintillaAddress(validPubKey);
            // Mock getPubKeyHash to return invalid length
            address.getPubKeyHash = () => new Uint8Array(19); // Invalid length
            expect(address.validate()).toBe(false);
        });
    });

    describe('toString', () => {
        it('should return correct sct address', () => {
            const address = new ScintillaAddress(validPubKey);
            expect(address.toString()).toBe(expectedSctAddress);
        });

        it('should return correct test address', () => {
            const address = new ScintillaAddress(validPubKey, 'tsct');
            expect(address.toString()).toBe(expectedTestAddress);
        });
    });

    describe('validateAddress', () => {
        it('should validate a valid Scintilla address', () => {
            const validAddress = 'sct150ctmpchzwgf6ycvuyyl569424ruxf4hlq8vlp';
            const result = ScintillaAddress.validateAddress(validAddress);
            expect(result).toHaveProperty('isValid', true);
            expect(result).toHaveProperty('prefix', 'sct');
            expect(Buffer.from(result.pubKeyHash).toString('hex')).toEqual('a3f0bd871713909d130ce109fa68b55547c326b7');
        });

        it('should validate an address with a custom prefix', () => {
            // Generate an address with a custom prefix
            const publicKey = new Uint8Array(33);
            publicKey[0] = 2; // Compressed public key marker
            for (let i = 1; i < 33; i++) {
                publicKey[i] = i;
            }
            
            const customPrefix = 'sct';
            const originalAddress = ScintillaAddress.fromPublicKey(publicKey, customPrefix);
            const addressString = originalAddress.toString();
            
            // Now decode it
            const result = ScintillaAddress.validateAddress(addressString);
            expect(result.prefix).toBe(customPrefix);
            expect(result.isValid).toBe(true);
            expect(Buffer.from(result.pubKeyHash).toString('hex')).toEqual('2eef74c226d9165fd8bcede31b58bf47300115a0');
        });

        it('should throw an error for an invalid address string', () => {
            expect(() => ScintillaAddress.validateAddress('invalid')).toThrow();
            expect(() => ScintillaAddress.validateAddress('')).toThrow();
            expect(() => ScintillaAddress.decodeAddress(null)).toThrow();
            
            // Valid bech32 format but incorrect checksum
            expect(() => ScintillaAddress.validateAddress('sct1qypqxpq9qcrsszg2pvxq6rs0zqg3yyc5z5udz00')).toThrow();
            
            // Valid bech32 format but wrong HRP
            expect(() => ScintillaAddress.validateAddress('bc1q2sfmfjfr4fwftlf7dus7puayhcpfenmsqwcatf')).toThrow();
        });
    });
}); 