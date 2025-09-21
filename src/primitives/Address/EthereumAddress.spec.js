import { describe, it, expect } from '@scintilla-network/litest';
import EthereumAddress from './EthereumAddress.js';
import PublicKey from '../PublicKey/PublicKey.js';
import { secp256k1 as secp } from "@scintilla-network/signatures/classic";

describe('EthereumAddress', () => {
    // Test vector from a known public key and its corresponding Ethereum address
    const validPubKeyHex = '0x037c6b16928e589c84362448ad19a315f350ed4a3dd01f5cb9c7be5a1dcdf533db';
    const validPubKey = new Uint8Array(Buffer.from(validPubKeyHex.slice(2), 'hex'));
    const expectedAddress = '0x616445109A9C2715A9490A441A0b5cF3b7b06DD5';

    describe('constructor', () => {
        it('should create address with valid public key', () => {
            const address = new EthereumAddress(validPubKey);
            expect(address).toBeInstanceOf(EthereumAddress);
            expect(address.validate()).toBe(true);
        });

        it('should create address with PublicKey instance', () => {
            const pubKeyInstance = new PublicKey(validPubKey);
            const address = new EthereumAddress(pubKeyInstance);
            expect(address.validate()).toBe(true);
        });

        it('should throw error if public key is invalid', () => {
            expect(() => new EthereumAddress('invalid')).toThrow('Public key must be a Uint8Array');
        });
    });

    describe('fromPublicKey', () => {
        it('should create address from compressed public key (33 bytes)', () => {
            const address = EthereumAddress.fromPublicKey(validPubKey);
            expect(address).toBeInstanceOf(EthereumAddress);
            expect(address.validate()).toBe(true);
            expect(address.toString()).toBe(expectedAddress);
        });

        it('should create address from uncompressed public key (65 bytes)', () => {
            // Create an uncompressed public key (0x04 + x + y coordinates)
            const point = secp.Point.fromBytes(validPubKey);
            const uncompressedKey = point.toBytes(false);
            const address = EthereumAddress.fromPublicKey(uncompressedKey);
            expect(address).toBeInstanceOf(EthereumAddress);
            expect(address.toString()).toBe(expectedAddress);
        });

        it('should throw error for invalid public key length', () => {
            const invalidKey = new Uint8Array(64); // Invalid length
            expect(() => EthereumAddress.fromPublicKey(invalidKey)).toThrow('Invalid public key length');
        });
    });

    describe('getPublicKey', () => {
        it('should return the original public key bytes', () => {
            const address = new EthereumAddress(validPubKey);
            expect(address.getPublicKey()).toEqual(validPubKey);
        });
    });

    describe('toChecksumAddress', () => {
        it('should convert to checksum address correctly', () => {
            const address = new EthereumAddress(validPubKey);
            expect(address.toString()).toBe(expectedAddress);
        });

        it('should handle addresses without 0x prefix', () => {
            const address = new EthereumAddress(validPubKey);
            const addrWithoutPrefix = expectedAddress.slice(2).toLowerCase();
            expect(address.toChecksumAddress(addrWithoutPrefix)).toBe(expectedAddress);
        });
    });

    describe('validate', () => {
        it('should return true for valid address', () => {
            const address = new EthereumAddress(validPubKey);
            expect(address.validate()).toBe(true);
        });

        it('should return false for invalid address format', () => {
            const address = new EthereumAddress(validPubKey);
            // Mock toString to return invalid address
            address.toString = () => '0xinvalid';
            expect(address.validate()).toBe(false);
        });

        it('should return false for address with invalid length', () => {
            const address = new EthereumAddress(validPubKey);
            // Mock toString to return address with wrong length
            address.toString = () => '0x1234';
            expect(address.validate()).toBe(false);
        });
    });

    describe('toString', () => {
        it('should return correct Ethereum address', () => {
            const address = new EthereumAddress(validPubKey);
            expect(address.toString()).toBe(expectedAddress);
        });
    });

    describe('validateAddress', () => {
        it('should decode a valid Ethereum address and generate a placeholder public key', () => {
            const validAddress = '0x616445109A9C2715A9490A441A0b5cF3b7b06DD5';
          
            const result = EthereumAddress.validateAddress(validAddress);
            expect(result).toHaveProperty('isValid', true);
        });

        it('should decode a valid checksum Ethereum address', () => {
            const validChecksumAddress = '0x8ba1f109551bD432803012645Ac136ddd64DBA72';
            const result = EthereumAddress.validateAddress(validChecksumAddress);
            
            expect(result).toHaveProperty('isValid', true);
        });

        it('should accept lowercase Ethereum addresses', () => {
            const lowercaseAddress = '0x8ba1f109551bd432803012645ac136ddd64dba72';
            const result = EthereumAddress.validateAddress(lowercaseAddress);
            expect(result).toHaveProperty('isValid', true);
        });

        it('should throw an error for invalid Ethereum addresses', () => {
            // Invalid length
            expect(() => EthereumAddress.validateAddress('0x8ba1f109551bd432803012645ac136ddd64dba')).toThrow();
            
            // Not starting with 0x
            expect(() => EthereumAddress.validateAddress('8ba1f109551bd432803012645ac136ddd64dba72')).toThrow();
            
            // Invalid characters
            expect(() => EthereumAddress.validateAddress('0x8ba1f109551bd432803012645ac136ddd64dba7z')).toThrow();
            
            // Empty string
            expect(() => EthereumAddress.validateAddress('')).toThrow();
            
            // Null
            expect(() => EthereumAddress.validateAddress(null)).toThrow();
        });

        it('should throw an error for addresses with invalid checksums', () => {
            // Valid address but incorrect checksum (some uppercase and lowercase mixed incorrectly)
            const invalidChecksumAddress = '0x8bA1F109551bd432803012645ac136DDd64dba72';
            expect(() => EthereumAddress.validateAddress(invalidChecksumAddress)).toThrow();
        });
    });
}); 