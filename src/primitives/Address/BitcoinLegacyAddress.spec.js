import { describe, it, expect } from '@scintilla-network/litest';
import BitcoinLegacyAddress from './BitcoinLegacyAddress.js';
import PublicKey from '../PublicKey/PublicKey.js';

describe('BitcoinLegacyAddress', () => {

    // Used Mnemonic for test vector: 
    // "test test test test test test test test test test test junk"
    // m/44'/0'/0'/0/0 pubkey: 02c29ab360da10dbcfe26000e13232911bcedc83bfd4c758ad7eaaed5f5ef8ebca
    // m/44'/0'/0'/0/0 address: 1Ei9UmLQv4o4UJTy5r5mnGFeC9auM3W5P1

    // Test vector from a known public key and its corresponding legacy address
    const validPubKeyHexMainnet = '02c29ab360da10dbcfe26000e13232911bcedc83bfd4c758ad7eaaed5f5ef8ebca';
    const validPubKeyMainnet = new Uint8Array(Buffer.from(validPubKeyHexMainnet, 'hex'));
    const expectedMainnetAddress = '1Ei9UmLQv4o4UJTy5r5mnGFeC9auM3W5P1';
    
    // coin 1 for testnet changes the pubkey
    const validPubKeyHexTestnet = '03244b42a9df73401473dff8ec9c7f85a080952c342494214d99a5ab13d6a71864';
    const validPubKeyTestnet = new Uint8Array(Buffer.from(validPubKeyHexTestnet, 'hex'));
    const expectedTestnetAddress = 'n118YqfT1hk8uvXcqcy4fwLDfVQfJpQTaS';

    describe('constructor', () => {
        it('should create address with valid public key for mainnet', () => {
            const address = new BitcoinLegacyAddress(validPubKeyMainnet);
            expect(address).toBeInstanceOf(BitcoinLegacyAddress);
            expect(address.toString()).toBe(expectedMainnetAddress);
        });

        it('should create address with valid public key for testnet', () => {
            const address = new BitcoinLegacyAddress(validPubKeyTestnet, 'testnet');
            expect(address).toBeInstanceOf(BitcoinLegacyAddress);
            expect(address.toString()).toBe(expectedTestnetAddress);
        });

        it('should create address with PublicKey instance', () => {
            const pubKeyInstance = new PublicKey(validPubKeyMainnet);
            const address = new BitcoinLegacyAddress(pubKeyInstance);
            expect(address.toString()).toBe(expectedMainnetAddress);
        });

        it('should throw error if public key is invalid', () => {
            expect(() => new BitcoinLegacyAddress('invalid')).toThrow('Public key must be a Uint8Array');
        });

        it('should throw error if network is invalid', () => {
            expect(() => new BitcoinLegacyAddress(validPubKeyMainnet, 'invalid')).toThrow('Invalid network: invalid');
        });
    });

    describe('fromPublicKey', () => {
        it('should create address from public key bytes', () => {
            const address = BitcoinLegacyAddress.fromPublicKey(validPubKeyMainnet);
            expect(address).toBeInstanceOf(BitcoinLegacyAddress);
            expect(address.toString()).toBe(expectedMainnetAddress);
        });

        it('should create address from PublicKey instance', () => {
            const pubKeyInstance = new PublicKey(validPubKeyMainnet);
            const address = BitcoinLegacyAddress.fromPublicKey(pubKeyInstance);
            expect(address.toString()).toBe(expectedMainnetAddress);
        });
    });

    describe('getPublicKey', () => {
        it('should return the original public key bytes', () => {
            const address = new BitcoinLegacyAddress(validPubKeyMainnet);
            expect(address.getPublicKey()).toEqual(validPubKeyMainnet);
        });
    });

    describe('validate', () => {
        it('should return true for valid mainnet address', () => {
            const address = new BitcoinLegacyAddress(validPubKeyMainnet);
            expect(address.validate()).toBe(true);
        });

        it('should return true for valid testnet address', () => {
            const address = new BitcoinLegacyAddress(validPubKeyTestnet, 'testnet');
            expect(address.validate()).toBe(true);
        });

        it('should return false for invalid address', () => {
            const address = new BitcoinLegacyAddress(validPubKeyMainnet);
            // Modify the version to make it invalid
            address.version = 0xfffff;
            expect(address.validate()).toBe(false);
        });
    });

    describe('toString', () => {
        it('should return correct mainnet address string', () => {
            const address = new BitcoinLegacyAddress(validPubKeyMainnet);
            expect(address.toString()).toBe(expectedMainnetAddress);
        });

        it('should return correct testnet address string', () => {
            const address = new BitcoinLegacyAddress(validPubKeyTestnet, 'testnet');
            expect(address.toString()).toBe(expectedTestnetAddress);
        });
    });

    describe('validateAddress', () => {
        it('should validate a valid mainnet legacy address', () => {
            const validAddress = '1Ei9UmLQv4o4UJTy5r5mnGFeC9auM3W5P1';
            const result = BitcoinLegacyAddress.validateAddress(validAddress);
            
            expect(result).toHaveProperty('isValid', true);
            expect(result).toHaveProperty('network', 'mainnet');
        });
        
        it('should decode a valid testnet legacy address', () => {
            const validTestnetAddress = 'n118YqfT1hk8uvXcqcy4fwLDfVQfJpQTaS';
            const result = BitcoinLegacyAddress.validateAddress(validTestnetAddress);
            
            expect(result).toHaveProperty('network', 'testnet');
            
            expect(result).toHaveProperty('isValid', true);
            expect(result).toHaveProperty('network', 'testnet');
        });
        
        it('should throw an error for invalid legacy addresses', () => {
            // Invalid checksum
            expect(() => BitcoinLegacyAddress.validateAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN3')).toThrow();
            
            // Invalid prefix (not a P2PKH address)
            expect(() => BitcoinLegacyAddress.validateAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toThrow();
            
            // Invalid characters
            expect(() => BitcoinLegacyAddress.validateAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2O')).toThrow();
            
            // Empty string
            expect(() => BitcoinLegacyAddress.validateAddress('')).toThrow();
            
            // Null
            expect(() => BitcoinLegacyAddress.validateAddress(null)).toThrow();
        });
        
        it('should throw an error for addresses with invalid length', () => {
            // Modified valid address but with too short length
            expect(() => BitcoinLegacyAddress.validateAddress('1BvBMSEYstWetqTFn5Au4m4G')).toThrow();
        });
    });
}); 