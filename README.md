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


## Utils 


### `base64`

```js
import { base64 } from '@scintilla-network/keys/utils';
```

- `toUint8Array(base64String: string): Uint8Array` - Converts base64 string to Uint8Array
```js
base64.toUint8Array('SGVsbG8sIFdvcmxkIQ=='); // Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33])
```

- `toHex(base64String: string): string` - Converts base64 string to hex string
```js
base64.toHex('SGVsbG8sIFdvcmxkIQ=='); // '48656c6c6f2c20576f726c6421'
```

- `toString(base64String: string): string` - Converts base64 string to string
```js
base64.toString('SGVsbG8sIFdvcmxkIQ=='); // 'Hello, World!'
```

- `fromUint8Array(bytes: Uint8Array): string` - Converts Uint8Array to base64 string
```js
base64.fromUint8Array(new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33])); // 'SGVsbG8sIFdvcmxkIQ=='
```
- `fromHex(hex: string): string` - Converts hex string to base64 string
```js
base64.fromHex('48656c6c6f2c20576f726c6421'); // 'SGVsbG8sIFdvcmxkIQ=='
```
- `fromString(string: string): string` - Converts string to base64 string
```js
base64.fromString('Hello, World!'); // 'SGVsbG8sIFdvcmxkIQ=='
```

### `bech32` / `bech32m`
```js
import { bech32, bech32m } from '@scintilla-network/keys/utils';
```

- `encode(prefix: string, words: number[], limit?: number): string` - Encodes words to bech32 string
- `decode(str: string, limit?: number): {prefix: string, words: number[]}` - Decodes bech32 string to words
- `decodeUnsafe(str: string, limit?: number): {prefix: string, words: number[]} | undefined` - Decodes bech32 string to words safely
- `toWords(bytes: number[]): number[]` - Converts bytes to words
- `fromWords(words: number[]): number[]` - Converts words to bytes
- `fromWordsUnsafe(words: number[]): number[] | undefined` - Converts words to bytes safely

### `escapeHTML` / `unescapeHTML`
```js
import { escapeHTML, unescapeHTML } from '@scintilla-network/keys/utils';
```

- `escapeHTML(str: string): string` - Escapes HTML characters
- `unescapeHTML(str: string): string` - Unescapes HTML characters

### `hex`
```js
import { hex } from '@scintilla-network/keys/utils';
```

- `isHex(hex: string): boolean` - Checks if hex string is valid
- `toUint8Array(hex: string): Uint8Array` - Converts hex string to Uint8Array
- `fromUint8Array(bytes: Uint8Array): string` - Converts Uint8Array to hex string
- `toHex(bytes: Uint8Array): string` - Converts Uint8Array to hex string
- `toString(hex: string): string` - Converts hex string to string

### `json`
```js
import { json } from '@scintilla-network/keys/utils';
```

- `stringify(obj: any): string` - Stringifies object
- `parse(str: string, options?: { shouldBigInt?: boolean; shouldUint8Array?: boolean }): any` - Parses JSON string
- `sortObjectByKey(obj: any): any` - Sorts object by key
- `sortedJsonByKeyStringify(obj: any): string` - Sorts object by key and stringifies object
- `excludingStringify(obj: any, fieldsToExclude?: string[]): string` - Excludes fields from an object and returns a JSON string

### `moniker`

```js
import { moniker } from '@scintilla-network/keys/utils';
```

- `validate(moniker: string): boolean` - Validates moniker
- `deriveSharedMonikerPath(moniker1: string, moniker2: string, hardened?: boolean): { path: string; moniker1AsNumber: number; moniker2AsNumber: number; truncatedHash: Uint8Array; fullHash: Uint8Array }` - Derives shared moniker path
- `deriveMonikerPath(moniker: string, hardened?: boolean): { path: string; monikerAsNumber: number; checksumAsNumber: number; truncatedHash: Uint8Array; fullHash: Uint8Array }` - Derives moniker path

### `uint8array`
```js
import { uint8array } from '@scintilla-network/keys/utils';
```

- `isUint8Array(input: any): boolean` - Checks if input is a Uint8Array
- `toHex(bytes: Uint8Array): string` - Converts Uint8Array to hex string
- `fromHex(hex: string): Uint8Array` - Converts hex string to Uint8Array
- `fromObject(obj: any): Uint8Array` - Converts object to Uint8Array
- `toObject(bytes: Uint8Array): any` - Converts Uint8Array to object
- `fromString(str: string): Uint8Array` - Converts string to Uint8Array
- `toString(bytes: Uint8Array): string` - Converts Uint8Array to string
- `toBigInt(bytes: Uint8Array): bigint` - Converts Uint8Array to bigint
- `fromBigInt(bigint: bigint): Uint8Array` - Converts bigint to Uint8Array
- `stringify(bytes: Uint8Array): string` - Converts Uint8Array to string
- `equals(bytes1: Uint8Array, bytes2: Uint8Array): boolean` - Checks if two Uint8Arrays are equals

### `utf8`
```js
import { utf8 } from '@scintilla-network/keys/utils';
```

- `toHex(str: string): string` - Converts UTF-8 string to hex string
- `toUint8Array(str: string): Uint8Array` - Converts UTF-8 string to Uint8Array
- `fromHex(hex: string): string` - Converts hex string to UTF-8 string
- `fromUint8Array(uint8Array: Uint8Array): string` - Converts Uint8Array to UTF-8 string
- `isUtf8(input: string | Uint8Array | ArrayBuffer): boolean` - Checks if input is a valid UTF-8 string

### `varbigint`
```js
import { varbigint } from '@scintilla-network/keys/utils';
```

0x00-0xFA (0-250): Single byte values  
0xFB + 2 bytes: 251-65535 (little-endian)  
0xFC + 4 bytes: 65536-4294967295 (little-endian)  
0xFD + 8 bytes: 4294967296-18446744073709551615 (little-endian)  
0xFE + 16 bytes: 18446744073709551616 to 2^128-1 (little-endian)  
0xFF + 32 bytes: Up to 2^256-1 (little-endian)

- `encodeVarBigInt(num: bigint, format?: 'hex' | 'uint8array'): string | Uint8Array` - Encodes bigint to varbigint
- `decodeVarBigInt(input: Uint8Array | string): { value: bigint; length: number }` - Decodes varbigint to bigint and returns the length of the buffer consumed.
- `getEncodingLength(num: bigint): number` - Gets the minimum number of bytes needed to encode a given value.
- `canEncode(num: bigint): boolean` - Checks if bigint can be encoded

```js
varbigint.encodeVarBigInt(100n); // Uint8Array([100])
varbigint.decodeVarBigInt(new Uint8Array([100])); // { value: 100n, length: 1 }
varbigint.getEncodingLength(100n); // 1
varbigint.canEncode(100n); // true
```

### `varint`

```typescript
import { varint } from '@scintilla-network/keys/utils';
```

0x00-0xFC (0-252): Single byte values  
0xFD + 2 bytes: 253-65535 (little-endian)  
0xFE + 4 bytes: 65536-4294967295 (little-endian)  
0xFF + 8 bytes: 4294967296-18446744073709551615 (little-endian)

- `encodeVarInt(num: number | bigint, format?: 'hex' | 'uint8array'): string | Uint8Array` - Encodes number or bigint to varint
- `decodeVarInt(input: Uint8Array | string): { value: number | bigint; length: number }` - Decodes varint to number or bigint
- `getEncodingLength(num: number | bigint): number` - Gets the encoding length of number or bigint
- `canEncode(num: number | bigint): boolean` - Checks if number or bigint can be encoded

```js
varint.encodeVarInt(100); // Uint8Array([100])
varint.decodeVarInt(new Uint8Array([100])); // { value: 100, length: 1 }
varint.getEncodingLength(100); // 1
varint.canEncode(100); // true
```

## Related Packages

- [@scintilla-network/signatures](https://www.npmjs.com/package/@scintilla-network/signatures)
- [@scintilla-network/hashes](https://www.npmjs.com/package/@scintilla-network/hashes)
- [@scintilla-network/mnemonic](https://www.npmjs.com/package/@scintilla-network/mnemonic)
- [@scintilla-network/ciphers](https://www.npmjs.com/package/@scintilla-network/ciphers)

## License

MIT License - see the [LICENSE](LICENSE) file for details