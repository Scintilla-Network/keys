import { SeedKeyring, Signer, SignableMessage, AddressKeyring, PublicKey } from './src/index.js';

let mnemonic = 'test test test test test test test test test test test junk';
//sct1pmnnxcaj8pxd33cyhrcds50sw8pptrx7rx93mj
let seedKeyring = SeedKeyring.fromMnemonic(mnemonic);
let chainKeyring = seedKeyring.getChainKeyring();
let accountKeyring = chainKeyring.getAccountKeyring(0);
let personaKeyring = accountKeyring.getPersonaKeyring('sct.alice');
let addressKeyring = personaKeyring.getAddressKeyring();
console.log(addressKeyring.getAddress().toString());

const signer = new Signer(addressKeyring.getPrivateKey());
const message = SignableMessage.fromString('Hello, world!');
const [signature, publicKey] = signer.sign(message);
const isValid = message.verify(signature, publicKey);

const address = addressKeyring.getAddress();
console.log('initial address', address.toString());

const isValid2 = message.verify(signature, publicKey);
console.log({messageIsValid: isValid, messageIsValid2: isValid2});

console.log(signer.toAddress().toString());