import { describe, it, expect } from '@scintilla-network/litest';
import SeedKeyring from '../../src/keyrings/SeedKeyring/SeedKeyring.js';

describe('Functional Tests', () => {
    let mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    let mnemonic2 = 'test test';
    let seed = Buffer.from('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', 'hex');

    describe('Base Keyrings', () => {
        it('should get seed from Mnemonic', () => {
            const seed = SeedKeyring.fromMnemonicToSeed(mnemonic);
            expect(seed).toBeDefined();
            expect(seed.toString('hex')).toBe(seed.toString('hex'));
        });

        it('should get address from Mnemonic', () => {
            const seedKeyring = SeedKeyring.fromMnemonic(mnemonic);
            const chainKeyring = seedKeyring.getChainKeyring();
            const accountKeyring = chainKeyring.getAccountKeyring(0);
            const addressKeyring = accountKeyring.getAddressKeyring();
            const address = addressKeyring.getAddress().toString();
            expect(address).toBe('sct170psr9zhfp9nd9qeyp0mdggxj9m7y6el2ezeq5');
        });

        it('should get address from Seed', () => {
            const seedKeyring = SeedKeyring.fromSeed(seed);
            const chainKeyring = seedKeyring.getChainKeyring();
            const accountKeyring = chainKeyring.getAccountKeyring(0);
            const addressKeyring = accountKeyring.getAddressKeyring();
            const address = addressKeyring.getAddress().toString();
            expect(address).toBe('sct170psr9zhfp9nd9qeyp0mdggxj9m7y6el2ezeq5');
        });

        it('should get address for Bitcoin', () => {
            const seedKeyring = SeedKeyring.fromMnemonic(mnemonic);
            expect(seedKeyring.getExtendedPrivateKey().toBase58()).toBe('xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu');
            const chainKeyring = seedKeyring.getChainKeyring({chain: 'bitcoin'});
            expect(chainKeyring.getExtendedPrivateKey().toBase58()).toBe('xprv9wnZLsHUEcR3UVuysrCTjAu7FWKXN2m5XVrgkEmeptHqi5yNkR8seouPutDWAJQcUPYDzTDgjK7G1h53M4QeA4myt6gUSUgdFhQSYw7XAV4');
            const accountKeyring = chainKeyring.getAccountKeyring(0);
            expect(accountKeyring.getExtendedPrivateKey().toBase58()).toBe('xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb');
            const addressKeyring = accountKeyring.getAddressKeyring();
            const address = addressKeyring.getAddress('bitcoin')
            expect(address.toString()).toBe('1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA');
        });

        it('should get address for Ethereum', () => {
            const seedKeyring = SeedKeyring.fromMnemonic(mnemonic);
            const chainKeyring = seedKeyring.getChainKeyring({chain: 'ethereum'});
            const accountKeyring = chainKeyring.getAccountKeyring(0);
            const addressKeyring = accountKeyring.getAddressKeyring();
            const address = addressKeyring.getAddress('ethereum');
            expect(address.toString()).toBe('0x9858EfFD232B4033E47d90003D41EC34EcaEda94');
        });
    });
    
    describe('Persona Keyrings', () => {
        it('should get address from Mnemonic', () => {
            const seedKeyring = SeedKeyring.fromMnemonic(mnemonic);
            const chainKeyring = seedKeyring.getChainKeyring();
            const accountKeyring = chainKeyring.getAccountKeyring(0);
            const personaKeyring = accountKeyring.getPersonaKeyring('sct.alice');
            const addressKeyring = personaKeyring.getAddressKeyring();
            const address = addressKeyring.getAddress().toString();
            expect(address).toBe('sct1xs3mt48hf9uyz36n5sdl5pfp99zgnlmslf6stm');

            const sharedPersonaKeyring1 = accountKeyring.getSharedPersonaKeyring('sct.alice', 'sct.bob');
            const sharedPersonaKeyring2 = accountKeyring.getSharedPersonaKeyring('sct.bob', 'sct.alice');

            const addressKeyring1 = sharedPersonaKeyring1.getAddressKeyring();
            const address1 = addressKeyring1.getAddress().toString();

            const addressKeyring2 = sharedPersonaKeyring2.getAddressKeyring();
            const address2 = addressKeyring2.getAddress().toString();

            expect(address1).toBe('sct1xszap63hzdaks75e2qr098ky3rxk4cp7vetdmu');
            expect(address2).toBe('sct1xszap63hzdaks75e2qr098ky3rxk4cp7vetdmu');
        });
    });

    describe('Persona Keyrings', () => {
        let mnemonic2 = 'test test test test test test test test test test test junk';
        let address = 'cosmos15yk64u7zc9g9k2yr2wmzeva5qgwxps6yxj00e7';

        it('should get address from Mnemonic', () => {
            const seedKeyring = SeedKeyring.fromMnemonic(mnemonic2);
            const chainKeyring = seedKeyring.getChainKeyring();
            const accountKeyring = chainKeyring.getAccountKeyring(0);
            const addressKeyring = accountKeyring.getAddressKeyring();
            const address = addressKeyring.getAddress().toString();
            expect(address).toBe(address);
        });
    });
});
