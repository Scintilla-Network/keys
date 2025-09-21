import { describe, it, expect } from '@scintilla-network/litest';
import BitcoinSegWitAddress from './BitcoinSegWitAddress.js';
import PublicKey from '../PublicKey/PublicKey.js';

describe('BitcoinSegWitAddress', () => {
    // Test vector from a known public key and its corresponding SegWit address
    // Purpose 84 (BIP84 P2WPKH)
    const validPubKeyHexMainnet = '0399871680e7bbdb1c958dc743d1a85de8b14ac24465f2f034649ddf39687dd363';
    const validPubKeyMainnet = new Uint8Array(Buffer.from(validPubKeyHexMainnet, 'hex'));

    const validPubKeyHexTestnet = '029cd4966bc5bd75f5cc55d630af2e1ea3ed3718f2a2fa8da2f1cd2c75c4dca3e9';
    const validPubKeyTestnet = new Uint8Array(Buffer.from(validPubKeyHexTestnet, 'hex'));

    const expectedMainnetAddress = 'bc1q2sfmfjfr4fwftlf7dus7puayhcpfenmsqwcatf';
    const expectedTestnetAddress = 'tb1qmrlpha8ffs697cgu7xe0w2rqhsujdq4sxy7w9l';

    describe('constructor', () => {
        it('should create address with valid public key for mainnet', () => {
            const address = new BitcoinSegWitAddress(validPubKeyMainnet);
            expect(address).toBeInstanceOf(BitcoinSegWitAddress);
            expect(address.validate()).toBe(true);
            expect(address.toString()).toBe(expectedMainnetAddress);
        });

        it('should create address with valid public key for testnet', () => {
            const address = new BitcoinSegWitAddress(validPubKeyTestnet, 'testnet');
            expect(address).toBeInstanceOf(BitcoinSegWitAddress);
            expect(address.validate()).toBe(true);
            expect(address.toString()).toBe(expectedTestnetAddress);
        });

        it('should create address with PublicKey instance', () => {
            const pubKeyInstance = new PublicKey(validPubKeyMainnet);
            const address = new BitcoinSegWitAddress(pubKeyInstance);
            expect(address.validate()).toBe(true);
            expect(address.toString()).toBe(expectedMainnetAddress);
        });

        it('should throw error if public key is invalid', () => {
            expect(() => new BitcoinSegWitAddress('invalid')).toThrow('Public key must be a Uint8Array');
        });

        it('should throw error if public key is not compressed', () => {
            const uncompressedKey = new Uint8Array(65); // Uncompressed public key length
            expect(() => new BitcoinSegWitAddress(uncompressedKey).toString())
                .toThrow('SegWit requires compressed public keys (33 bytes)');
        });
    });

    describe('fromPublicKey', () => {
        it('should create address from public key bytes', () => {
            const address = BitcoinSegWitAddress.fromPublicKey(validPubKeyMainnet);
            expect(address).toBeInstanceOf(BitcoinSegWitAddress);
            expect(address.validate()).toBe(true);
        });

        it('should create address from PublicKey instance', () => {
            const pubKeyInstance = new PublicKey(validPubKeyMainnet);
            const address = BitcoinSegWitAddress.fromPublicKey(pubKeyInstance);
            expect(address.validate()).toBe(true);
        });
    });

    describe('getPublicKey', () => {
        it('should return the original public key bytes', () => {
            const address = new BitcoinSegWitAddress(validPubKeyMainnet);
            expect(address.getPublicKey()).toEqual(validPubKeyMainnet);
        });
    });

    describe('getWitnessProgram', () => {
        it('should return valid witness program', () => {
            const address = new BitcoinSegWitAddress(validPubKeyMainnet);
            const program = address.getWitnessProgram();
            expect(program.length).toBe(21); // 1 byte version + 20 bytes pubkey hash
            expect(program[0]).toBe(0); // Witness version 0
        });
    });

    describe('validate', () => {
        it('should return true for valid mainnet address', () => {
            const address = new BitcoinSegWitAddress(validPubKeyMainnet);
            expect(address.validate()).toBe(true);
        });

        it('should return true for valid testnet address', () => {
            const address = new BitcoinSegWitAddress(validPubKeyTestnet, 'testnet');
            expect(address.validate()).toBe(true);
        });

        it('should return false for invalid network prefix', () => {
            const address = new BitcoinSegWitAddress(validPubKeyMainnet);
            address.prefix = 'invalid';
            expect(address.validate()).toBe(false);
        });

        it('should return false for invalid witness version', () => {
            const address = new BitcoinSegWitAddress(validPubKeyMainnet);
            address.witnessVersion = 99; // Invalid version
            expect(address.validate()).toBe(false);
        });
    });

    describe('toString', () => {
        it('should return correct mainnet address string', () => {
            const address = new BitcoinSegWitAddress(validPubKeyMainnet);
            expect(address.toString()).toBe(expectedMainnetAddress);
        });

        it('should return correct testnet address string', () => {
            const address = new BitcoinSegWitAddress(validPubKeyTestnet, 'testnet');
            expect(address.toString()).toBe(expectedTestnetAddress);
        });

        it('should throw error for invalid pubkey hash length', () => {
            const address = new BitcoinSegWitAddress(validPubKeyMainnet);
            // Mock getPubKeyHash to return invalid length
            address.getPubKeyHash = () => new Uint8Array(19); // Invalid length
            expect(() => address.toString()).toThrow('Invalid pubkey hash length for P2WPKH');
        });
    });

    describe('validateAddress', () => {
        it('should decode a valid mainnet SegWit address', () => {
            const validAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
            const result = BitcoinSegWitAddress.validateAddress(validAddress);
            
            expect(result).toHaveProperty('isValid', true);
            expect(result).toHaveProperty('network', 'mainnet');
            expect(result).toHaveProperty('witnessVersion', 0);
        });
        
        it('should decode a valid testnet SegWit address', () => {
            const validTestnetAddress = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';
            const result = BitcoinSegWitAddress.validateAddress(validTestnetAddress);
            
            expect(result).toHaveProperty('network', 'testnet');
            expect(result).toHaveProperty('witnessVersion', 0);
            expect(result).toHaveProperty('isValid', true);
        });
        
        it('should throw an error for invalid SegWit addresses', () => {
            // Invalid checksum
            expect(() => BitcoinSegWitAddress.validateAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t5')).toThrow();
            
            // Invalid prefix
            expect(() => BitcoinSegWitAddress.validateAddress('bb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')).toThrow();
            
            // Invalid length
            expect(() => BitcoinSegWitAddress.validateAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7k')).toThrow();
            
            // Empty string
            expect(() => BitcoinSegWitAddress.validateAddress('')).toThrow();
            
            // Null
            expect(() => BitcoinSegWitAddress.validateAddress(null)).toThrow();
        });
        
        it('should throw an error for unsupported witness version', () => {
            // v1 SegWit address (P2TR/Taproot format)
            const v1Address = 'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0';
            expect(() => BitcoinSegWitAddress.validateAddress(v1Address)).toThrow();
        });
    });
}); 