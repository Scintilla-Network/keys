import { describe, it, expect, beforeEach, vi } from '@scintilla-network/litest';
import Address from './Address.js';
import ScintillaAddress from './ScintillaAddress.js';
import EthereumAddress from './EthereumAddress.js';
import BitcoinSegWitAddress from './BitcoinSegWitAddress.js';
import BitcoinLegacyAddress from './BitcoinLegacyAddress.js';
import CosmosAddress from './CosmosAddress.js';

describe('Address', () => {
  // Sample public keys for testing
  let samplePublicKey;
  let validEthPublicKey;
  
  // Sample addresses for testing fromString and auto-detection
  const sampleScintillaAddressStr = 'sct1qypqxpq9qcrsszg2pvxq6rs0zqg3yyc5z5udzq2';
  const sampleEthereumAddressStr = '0x8ba1f109551bD432803012645Ac136ddd64DBA72';
  const sampleBitcoinSegWitAddressStr = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
  const sampleBitcoinLegacyAddressStr = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
  const sampleCosmosAddressStr = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
  
  beforeEach(() => {
    // Create a sample public key for testing (33 bytes - compressed format)
    samplePublicKey = new Uint8Array(33);
    for (let i = 0; i < 33; i++) {
      samplePublicKey[i] = i;
    }
    
    // Use a valid Ethereum public key from EthereumAddress.spec.js
    // This is a known valid public key that corresponds to a real Ethereum address
    const validPubKeyHex = '037c6b16928e589c84362448ad19a315f350ed4a3dd01f5cb9c7be5a1dcdf533db';
    validEthPublicKey = new Uint8Array(Buffer.from(validPubKeyHex, 'hex'));
  });
  
  describe('Constructor', () => {
    it('should create a Scintilla address by default', () => {
      const address = new Address(samplePublicKey);
      expect(address.getType()).toBe('scintilla');
      expect(address.getAddressInstance()).toBeInstanceOf(ScintillaAddress);
    });
    
    it('should create an Ethereum address when specified', () => {
      const address = new Address(validEthPublicKey, null, 'ethereum');
      expect(address.getType()).toBe('ethereum');
      expect(address.getAddressInstance()).toBeInstanceOf(EthereumAddress);
    });
    
    it('should create a Bitcoin SegWit address when specified', () => {
      const address = new Address(samplePublicKey, 'mainnet', 'bitcoin-segwit');
      expect(address.getType()).toBe('bitcoin-segwit');
      expect(address.getAddressInstance()).toBeInstanceOf(BitcoinSegWitAddress);
    });
    
    it('should create a Bitcoin Legacy address when specified', () => {
      const address = new Address(samplePublicKey, 'mainnet', 'bitcoin-legacy');
      expect(address.getType()).toBe('bitcoin-legacy');
      expect(address.getAddressInstance()).toBeInstanceOf(BitcoinLegacyAddress);
    });
    
    it('should create a Cosmos address when specified', () => {
      const address = new Address(samplePublicKey, 'cosmos', 'cosmos');
      expect(address.getType()).toBe('cosmos');
      expect(address.getAddressInstance()).toBeInstanceOf(CosmosAddress);
    });
    
    it('should throw an error for an unsupported address type', () => {
      expect(() => new Address(samplePublicKey, '', 'unsupported-type')).toThrow();
    });
    
    it('should accept custom options', () => {
      const options = { witnessVersion: 0 };
      const address = new Address(samplePublicKey, 'mainnet', 'bitcoin-segwit', options);
      expect(address.getType()).toBe('bitcoin-segwit');
    });
  });
  
  describe('toString', () => {
    it('should return a string representation of the address', () => {
      const scintillaAddress = new Address(samplePublicKey);
      expect(typeof scintillaAddress.toString()).toBe('string');
      
      const ethAddress = new Address(validEthPublicKey, null, 'ethereum');
      expect(typeof ethAddress.toString()).toBe('string');
    });
  });
  
  describe('validate', () => {
    it('should validate the address', () => {
      const address = new Address(samplePublicKey);
      expect(typeof address.validate()).toBe('boolean');
    });
  });
  
  describe('fromPublicKey', () => {
    it('should create an address from a public key', () => {
      const address = Address.fromPublicKey(samplePublicKey);
      expect(address).toBeInstanceOf(Address);
      expect(address.getType()).toBe('scintilla');
    });
    
    it('should create a specific address type from a public key', () => {
      const address = Address.fromPublicKey(validEthPublicKey, null, 'ethereum');
      expect(address).toBeInstanceOf(Address);
      expect(address.getType()).toBe('ethereum');
    });
  });
  
  describe('fromString', () => {
    it('should create a Scintilla address from a string', () => {
      // Mock the ScintillaAddress.decodeAddress method
      const originalDecodeAddress = ScintillaAddress.decodeAddress;
      ScintillaAddress.decodeAddress = vi.fn().mockReturnValue({
        publicKey: samplePublicKey,
        prefix: 'sct'
      });
      
      try {
        const address = Address.fromString(sampleScintillaAddressStr, 'scintilla');
        expect(address).toBeInstanceOf(Address);
        expect(address.getType()).toBe('scintilla');
        expect(ScintillaAddress.decodeAddress).toHaveBeenCalledWith(sampleScintillaAddressStr);
      } finally {
        // Restore the original method
        ScintillaAddress.decodeAddress = originalDecodeAddress;
      }
    });
    
    it('should create an Ethereum address from a string', () => {
      // Mock the EthereumAddress.decodeAddress method
      const originalDecodeAddress = EthereumAddress.decodeAddress;
      EthereumAddress.decodeAddress = vi.fn().mockReturnValue(validEthPublicKey);
      
      try {
        const address = Address.fromString(sampleEthereumAddressStr, 'ethereum');
        expect(address).toBeInstanceOf(Address);
        expect(address.getType()).toBe('ethereum');
        expect(EthereumAddress.decodeAddress).toHaveBeenCalledWith(sampleEthereumAddressStr);
      } finally {
        // Restore the original method
        EthereumAddress.decodeAddress = originalDecodeAddress;
      }
    });
    
    it('should create a Bitcoin SegWit address from a string', () => {
      // Mock the BitcoinSegWitAddress.decodeAddress method
      const originalDecodeAddress = BitcoinSegWitAddress.decodeAddress;
      BitcoinSegWitAddress.decodeAddress = vi.fn().mockReturnValue({
        publicKey: samplePublicKey,
        network: 'mainnet'
      });
      
      try {
        const address = Address.fromString(sampleBitcoinSegWitAddressStr, 'bitcoin-segwit');
        expect(address).toBeInstanceOf(Address);
        expect(address.getType()).toBe('bitcoin-segwit');
        expect(BitcoinSegWitAddress.decodeAddress).toHaveBeenCalledWith(sampleBitcoinSegWitAddressStr);
      } finally {
        // Restore the original method
        BitcoinSegWitAddress.decodeAddress = originalDecodeAddress;
      }
    });
    
    it('should throw an error for an unsupported address type', () => {
      expect(() => Address.fromString('invalid-address', 'unsupported-type')).toThrow();
    });
  });
  
  describe('fromStringAutoDetect', () => {
    it('should detect and create a Scintilla address', () => {
      // Mock fromString method
      const originalFromString = Address.fromString;
      Address.fromString = vi.fn().mockImplementation((str, type) => {
        expect(type).toBe('scintilla');
        return new Address(samplePublicKey, 'sct', 'scintilla');
      });
      
      try {
        const address = Address.fromStringAutoDetect(sampleScintillaAddressStr);
        expect(address).toBeInstanceOf(Address);
        expect(address.getType()).toBe('scintilla');
        expect(Address.fromString).toHaveBeenCalledWith(sampleScintillaAddressStr, 'scintilla');
      } finally {
        // Restore the original method
        Address.fromString = originalFromString;
      }
    });
    
    it('should detect and create an Ethereum address', () => {
      // Mock fromString method
      const originalFromString = Address.fromString;
      Address.fromString = vi.fn().mockImplementation((str, type) => {
        expect(type).toBe('ethereum');
        return new Address(validEthPublicKey, null, 'ethereum');
      });
      
      try {
        const address = Address.fromStringAutoDetect(sampleEthereumAddressStr);
        expect(address).toBeInstanceOf(Address);
        expect(address.getType()).toBe('ethereum');
        expect(Address.fromString).toHaveBeenCalledWith(sampleEthereumAddressStr, 'ethereum');
      } finally {
        // Restore the original method
        Address.fromString = originalFromString;
      }
    });
    
    it('should detect and create a Bitcoin SegWit address', () => {
      // Mock fromString method
      const originalFromString = Address.fromString;
      Address.fromString = vi.fn().mockImplementation((str, type) => {
        expect(type).toBe('bitcoin-segwit');
        return new Address(samplePublicKey, 'mainnet', 'bitcoin-segwit');
      });
      
      try {
        const address = Address.fromStringAutoDetect(sampleBitcoinSegWitAddressStr);
        expect(address).toBeInstanceOf(Address);
        expect(address.getType()).toBe('bitcoin-segwit');
        expect(Address.fromString).toHaveBeenCalledWith(sampleBitcoinSegWitAddressStr, 'bitcoin-segwit');
      } finally {
        // Restore the original method
        Address.fromString = originalFromString;
      }
    });
    
    it('should detect and create a Bitcoin Legacy address', () => {
      // Mock fromString method
      const originalFromString = Address.fromString;
      Address.fromString = vi.fn().mockImplementation((str, type) => {
        expect(type).toBe('bitcoin-legacy');
        return new Address(samplePublicKey, 'mainnet', 'bitcoin-legacy');
      });
      
      try {
        const address = Address.fromStringAutoDetect(sampleBitcoinLegacyAddressStr);
        expect(address).toBeInstanceOf(Address);
        expect(address.getType()).toBe('bitcoin-legacy');
        expect(Address.fromString).toHaveBeenCalledWith(sampleBitcoinLegacyAddressStr, 'bitcoin-legacy');
      } finally {
        // Restore the original method
        Address.fromString = originalFromString;
      }
    });
    
    it('should detect and create a Cosmos address', () => {
      // Mock fromString method
      const originalFromString = Address.fromString;
      Address.fromString = vi.fn().mockImplementation((str, type) => {
        expect(type).toBe('cosmos');
        return new Address(samplePublicKey, 'cosmos', 'cosmos');
      });
      
      try {
        const address = Address.fromStringAutoDetect(sampleCosmosAddressStr);
        expect(address).toBeInstanceOf(Address);
        expect(address.getType()).toBe('cosmos');
        expect(Address.fromString).toHaveBeenCalledWith(sampleCosmosAddressStr, 'cosmos');
      } finally {
        // Restore the original method
        Address.fromString = originalFromString;
      }
    });
    
    it('should throw an error for an unrecognized address format', () => {
      expect(() => Address.fromStringAutoDetect('invalid-address-format')).toThrow();
    });
  });
}); 