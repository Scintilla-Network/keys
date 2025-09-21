# @scintilla-network/keys

Key management and derivation library for Scintilla Network with support for multiple key types, personas, and chains.

[![npm version](https://badge.fury.io/js/@scintilla-network%2Fkeys.svg)](https://www.npmjs.com/package/@scintilla-network/keys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Key Management**
  - Extended key derivation (BIP32)
  - Mnemonic support (BIP39)
  - Multiple chain support (BIP44)
  - Secure key storage
- **Persona Management**
  - Personal personas
  - Shared personas
  - Moniker-based derivation
  - Watch-only support
- **Chain Support**
  - Bitcoin (BIP44/49/84)
  - Ethereum
  - Cosmos
  - Scintilla
- **Message Encryption, Decryption, Signing and Verification**
  - SignableMessage primitive with signing and encryption methods
  - Signer primitive to handle signing and encryption
- **Security**
  - Secure key derivation
  - Watch-only mode
  - Private key protection
  - Zero dependencies beyond Scintilla core

## Installation

```bash
npm install @scintilla/keys
```

## Quick Start

```javascript
    import { SeedKeyring } from '@scintilla-network/keys';
    // Create from mnemonic
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const keyring = SeedKeyring.fromMnemonic(mnemonic);
    // Get chain-specific keyring (scintilla chain)
    const chainKeyring = keyring.getChainKeyring();
    // Get specific account (account: 0, see bip44)
    const accountKeyring = chainKeyring.getAccountKeyring(0);

    const addressKeyring = accountKeyring.getAddressKeyring();
    const address = addressKeyring.getAddress().toString(); // sct170psr9zhfp9nd9qeyp0mdggxj9m7y6el2ezeq5

    // Create shared persona (between two users)
    const sharedKeyring = accountKeyring.getSharedPersonaKeyring('sct.alice', 'sct.bob');

    import { SignableMessage } from '@scintilla-network/keys';

    const message = SignableMessage.fromString('Hello World');
    const signer = sharedKeyring.getSigner();

    const [signature, publicKey] = message.sign(signer); // sign the message which can be verified with message.verify(signature, publicKey)

    const encryptedMessage = message.encrypt(signer); // encrypt the message which can be decrypted with message.decrypt(encryptedMessage, signer)
```

## Usage Guide

### Seed Management

```javascript
    import { SeedKeyring } from '@scintilla-network/keys';
    // From mnemonic
    const keyring = SeedKeyring.fromMnemonic(mnemonic);
    // From seed
    const seedBuffer = Buffer.from('your-seed-hex', 'hex');
    const keyring = SeedKeyring.fromSeed(seedBuffer);
    // Get chain keyring
    const chainKeyring = keyring.getChainKeyring({
        chain: 'scintilla', // or 'scintilla', 'ethereum', 'cosmos', 'bitcoin'
        purpose: 44, // optional: BIP44/49/84
        coinType: 8888 // optional: chain-specific (btc: 0, eth: 60)
    });
```

### Persona Management

```javascript
import { SharedPersonaKeyring } from '@scintilla-network/keys';
// Create shared persona
const sharedKeyring = new SharedPersonaKeyring(extendedKey,'alice','bob');
// Get address keyring
const addressKeyring = sharedKeyring.getAddressKeyring(0, { change: 0 });
// Create watch-only persona
const watchOnly = SharedPersonaKeyring.fromExtendedPublicKey(extendedPublicKey,'alice','bob');
```

### SignableMessage

Handles message signing and verification:

```typescript
const message = SignableMessage.fromString("Hello World");
const signer = new Signer(derivableKey);

// Sign message
const [signature, publicKey] = message.sign(signer);

// Verify signature
const isValid = message.verify(signature, publicKey);

// Encrypt message
const encryptedMessage = message.encrypt(signer);

// Decrypt message
const decryptedMessage = message.decrypt(encryptedMessage, signer);
```

### Signer

Provides advanced signing capabilities with multiple algorithms:

```typescript
// Create signer with optional moniker
const signer = new Signer(derivableKey, "myKey");

// Sign with default SECP256K1
const [signature, pubKey] = signer.signMessage("message");

// Sign with BLS
const [blsSignature, blsPubKey] = signer.signMessage("message", Signer.ALGORITHM.BLS);

// Verify signatures
const isValid = signer.verifyMessage(signature, "message", pubKey);

// Encrypt message
const encryptedMessage = signer.encrypt(SignableMessage.fromString('message'));

// Decrypt message
const decryptedMessage = signer.decrypt(encryptedMessage, signer);
```

### Utils

The library provides utility functions:

```typescript
const { bech32, bech32m, escapeHTML, isHexadecimal, sortObjectByKey } = utils;
```

## Key Types

### SeedKeyring
- Root key management
- Chain derivation
- BIP32/39/44 support

### SharedPersonaKeyring
- Shared key derivation
- Moniker-based paths
- Watch-only support

### ChainKeyring
- Chain-specific derivation
- Multiple address types
- BIP44/49/84 support

### AddressKeyring
- Single address management
- Transaction signing
- Public/private key handling

## Security Considerations

### Key Storage
- Never store private keys in plaintext
- Consider hardware security modules
- Enable watch-only mode when possible

## API Reference

### `DerivableKey`

#### Constructor Options
- `privateKey`: (string | Buffer) - Either a hex string private key or a seed buffer
- `node`: (HDKey) - Optional HD key node
- `isMaster`: (boolean) - Whether this is a master key for derivation

#### Methods
- `derive(path: string): DerivableKey` - Derives a child key from the given path
- `toAddress(prefix?: string): string` - Generates an address with optional prefix
- `getAccount(accountIndex?: number, coinType?: number): Account` - Derives a child account

### `SignableMessage`

#### Constructor Options
- `input`: (Uint8Array) - The message to be signed

#### Static Methods
- `fromHex(hex: string): SignableMessage` - Creates SignableMessage from hex string
- `fromObject(object: object): SignableMessage` - Creates SignableMessage from object
- `fromString(string: string): SignableMessage` - Creates SignableMessage from string

#### Methods
- `toHex(): string` - Converts message to hex format
- `sign(signer: Signer): [string, string]` - Signs message, returns [signature, publicKey]
- `verify(signature: string, publicKey: string): boolean` - Verifies signature
- `encrypt(signer: Signer, algorithm?: CIPHERS, nonce?: Uint8Array): string` - Encrypts message
- `decrypt(encryptedMessage: string, signer: Signer, algorithm?: CIPHERS): string` - Decrypts message

#### Methods
- `toHex(): string` - Converts message to hex format
- `sign(signer: Signer): [string, string]` - Signs message, returns [signature, publicKey]
- `verify(signature: string, publicKey: string): boolean` - Verifies signature
- `encrypt(signer: Signer, algorithm?: CIPHERS, nonce?: Uint8Array): string` - Encrypts message
- `decrypt(encryptedMessage: string, signer: Signer, algorithm?: CIPHERS): string` - Decrypts message

### `Signer`

#### Constructor Options
- `derivableKey`: (DerivableKey | string) - Key for signing
- `moniker`: (string | null) - Optional identifier
- `type`: (string) - Signer type, defaults to 'persona.owner'

#### Methods
- `signMessage(message: any, algorithm?: ALGORITHM): [string, string]` - Signs message with specified algorithm
- `verifyMessage(signature: string, message: any, publicKey: string, algorithm?: ALGORITHM): boolean` - Verifies signature
- `toAddress(bech32Prefix?: string): string` - Generates address from signer's key
- `encrypt(message: SignableMessage, algorithm?: CIPHERS, nonce?: Uint8Array): string` - Encrypts message
- `decrypt(encryptedMessage: string, algorithm?: CIPHERS): string` - Decrypts message

## Related Packages

- [@scintilla-network/signatures](https://www.npmjs.com/package/@scintilla-network/signatures)
- [@scintilla-network/hashes](https://www.npmjs.com/package/@scintilla-network/hashes)
- [@scintilla-network/mnemonic](https://www.npmjs.com/package/@scintilla-network/mnemonic)
- [@scintilla-network/ciphers](https://www.npmjs.com/package/@scintilla-network/ciphers)

## License

MIT License - see the [LICENSE](LICENSE) file for details