import { describe, it, expect } from '@scintilla-network/litest';
import CosmosAddress from './CosmosAddress.js';
import PublicKey from '../PublicKey/PublicKey.js';
import { bech32 } from '@scintilla-network/hashes/utils';

describe('CosmosAddress', () => {
    // Test vector from a known public key and its corresponding Cosmos address
    const validPubKeyHex = '0235396657899c8a056fbda82389107f1e0beb06b96aafb19c944754271ea6c23f';
    const validPubKey = new Uint8Array(Buffer.from(validPubKeyHex, 'hex'));
    const expectedCosmosAddress = 'cosmos1myjt9cxqey6g8yspa58mv4urw5wegash6tfv3p';
    const expectedOsmoAddress = 'osmo1myjt9cxqey6g8yspa58mv4urw5wegashjs6u8n';
    const expectedScintillaAddress = 'sct1myjt9cxqey6g8yspa58mv4urw5wegash2tzrnu';
    const expectedTestnetScintillaAddress = 'tsct1myjt9cxqey6g8yspa58mv4urw5wegashy7t8nd';

    // Debug: decode the expected address
    const decoded = bech32.decode(expectedCosmosAddress);
    const decodedHash = bech32.fromWords(decoded.words);

    // Debug: decode the bech32 public key
    const bech32PubKey = 'cosmospub1addwnpepqg6njejh3xwg5pt0hk5z8zgs0u0qh6cxh942lvvuj3r4gfc75mpr7d9nu8x';
    const decodedPubKey = bech32.decode(bech32PubKey);
    const pubKeyBytes = bech32.fromWords(decodedPubKey.words);

    describe('constructor', () => {
        it('should create address with valid public key and default prefix', () => {
            const address = new CosmosAddress(validPubKey);
            expect(address).toBeInstanceOf(CosmosAddress);
            expect(address.validate()).toBe(true);
            expect(address.prefix).toBe('cosmos');
        });

        it('should create address with custom prefix', () => {
            const address = new CosmosAddress(validPubKey, 'osmo');
            expect(address).toBeInstanceOf(CosmosAddress);
            expect(address.validate()).toBe(true);
            expect(address.prefix).toBe('osmo');
        });

        it('should create address with PublicKey instance', () => {
            const pubKeyInstance = new PublicKey(validPubKey);
            const address = new CosmosAddress(pubKeyInstance);
            expect(address.validate()).toBe(true);
        });

        it('should create address with bech32-encoded public key', () => {
            const address = new CosmosAddress(bech32PubKey);
            expect(address).toBeInstanceOf(CosmosAddress);
            expect(address.validate()).toBe(true);
            expect(address.prefix).toBe('cosmos');
        });

        it('should throw error if public key is invalid', () => {
            expect(() => new CosmosAddress('invalid')).toThrow('Public key must be a Uint8Array');
        });
    });

    describe('fromPublicKey', () => {
        it('should create address from public key bytes with default prefix', () => {
            const address = CosmosAddress.fromPublicKey(validPubKey);
            expect(address).toBeInstanceOf(CosmosAddress);
            expect(address.validate()).toBe(true);
            expect(address.toString()).toBe(expectedCosmosAddress);
        });

        it('should create address from public key bytes with custom prefix', () => {
            const address = CosmosAddress.fromPublicKey(validPubKey, 'osmo');
            expect(address).toBeInstanceOf(CosmosAddress);
            expect(address.validate()).toBe(true);
            expect(address.toString()).toBe(expectedOsmoAddress);

            const address2 = CosmosAddress.fromPublicKey(validPubKey, 'sct');
            expect(address2).toBeInstanceOf(CosmosAddress);
            expect(address2.validate()).toBe(true);
            expect(address2.toString()).toBe(expectedScintillaAddress);
            
            const address3 = CosmosAddress.fromPublicKey(validPubKey, 'tsct');
            expect(address3).toBeInstanceOf(CosmosAddress);
            expect(address3.validate()).toBe(true);
            expect(address3.toString()).toBe(expectedTestnetScintillaAddress);
        });

        it('should create address from PublicKey instance', () => {
            const pubKeyInstance = new PublicKey(validPubKey);
            const address = CosmosAddress.fromPublicKey(pubKeyInstance);
            expect(address.validate()).toBe(true);
        });
    });

    describe('getPublicKey', () => {
        it('should return the original public key bytes', () => {
            const address = new CosmosAddress(validPubKey);
            expect(address.getPublicKey()).toEqual(validPubKey);
        });
    });

    describe('getPubKeyHash', () => {
        it('should return valid hash160 of public key', () => {
            const address = new CosmosAddress(validPubKey);
            const hash = address.getPubKeyHash();
            expect(hash).toBeInstanceOf(Uint8Array);
            expect(hash.length).toBe(20); // hash160 output is always 20 bytes
        });
    });

    describe('validate', () => {
        it('should return true for valid cosmos address', () => {
            const address = new CosmosAddress(validPubKey);
            expect(address.validate()).toBe(true);
        });

        it('should return true for valid custom prefix address', () => {
            const address = new CosmosAddress(validPubKey, 'osmo');
            expect(address.validate()).toBe(true);
        });

        it('should return false for invalid prefix', () => {
            const address = new CosmosAddress(validPubKey);
            address.prefix = 'invalid!@#';
            expect(address.validate()).toBe(false);
        });

        it('should return false for invalid pubkey hash length', () => {
            const address = new CosmosAddress(validPubKey);
            // Mock getPubKeyHash to return invalid length
            address.getPubKeyHash = () => new Uint8Array(19); // Invalid length
            expect(address.validate()).toBe(false);
        });
    });

    describe('toString', () => {
        it('should return correct cosmos address', () => {
            const address = new CosmosAddress(validPubKey);
            expect(address.toString()).toBe(expectedCosmosAddress);
        });

        it('should return correct address with custom prefix', () => {
            const address = new CosmosAddress(validPubKey, 'osmo');
            expect(address.toString()).toBe(expectedOsmoAddress);
        });
    });

    describe('validateAddress', () => {
        it('should decode a valid cosmos address', () => {
            const validAddress = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
            const result = CosmosAddress.validateAddress(validAddress);
            console.log(result);
            
            expect(result).toHaveProperty('isValid', true);
            expect(result).toHaveProperty('prefix', 'cosmos');
        });
        
        it('should decode an address with a custom prefix', () => {
            // SCT address
            const validScintillaAddress = 'sct1myjt9cxqey6g8yspa58mv4urw5wegash2tzrnu';
            const result = CosmosAddress.validateAddress(validScintillaAddress);
            
            expect(result).toHaveProperty('prefix', 'sct');
            expect(result).toHaveProperty('isValid', true);
        });
        
        it('should throw an error for invalid cosmos addresses', () => {
            // Invalid checksum
            expect(() => CosmosAddress.validateAddress('cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd03')).toThrow();
            
            // Invalid prefix format (has uppercase letters)
            expect(() => CosmosAddress.validateAddress('Cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02')).toThrow();
            
            // Empty string
            expect(() => CosmosAddress.validateAddress('')).toThrow();
            
            // Null
            expect(() => CosmosAddress.validateAddress(null)).toThrow();
        });
        
        it('should throw an error for an address with invalid length', () => {
            // Too short
            expect(() => CosmosAddress.validateAddress('cosmos1hsk6jryyqjfhp5dhc55tc9jtckyg')).toThrow();
            
            // Too long (modified valid address)
            expect(() => CosmosAddress.validateAddress('cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02123456')).toThrow();
        });
    });
}); 