import { describe, expect, test } from 'vitest';
import { Connection, PublicKey } from '@solana/web3.js';
import { derivePartnerMetadataPda, deriveVirtualPoolMetadataPda } from '../../src/utils/app-store';
import { AppStoreService } from '../../src/services/app-store';
import { METEORA_DBC_PROGRAM_ID } from '../../src/constants';

describe('app-store PDA derivation utilities', () => {
	const feeClaimer = new PublicKey('Fj8j9XScg8jB5TfF5fPK3Qw8pGC66oi7A9phei9anez9');
	const virtualPool = new PublicKey('So11111111111111111111111111111111111111112');

	test('derivePartnerMetadataPda derives PDA deterministically', () => {
		const pda = derivePartnerMetadataPda(feeClaimer);

		const [expected] = PublicKey.findProgramAddressSync(
			[Buffer.from('partner_metadata'), feeClaimer.toBuffer()],
			new PublicKey(METEORA_DBC_PROGRAM_ID)
		);

		expect(pda.equals(expected)).toBe(true);
	});

	test('derivePartnerMetadataPda returns same result for same input', () => {
		const pda1 = derivePartnerMetadataPda(feeClaimer);
		const pda2 = derivePartnerMetadataPda(feeClaimer);

		expect(pda1.equals(pda2)).toBe(true);
	});

	test('derivePartnerMetadataPda returns different PDAs for different fee claimers', () => {
		const otherFeeClaimer = new PublicKey('So11111111111111111111111111111111111111112');
		const pda1 = derivePartnerMetadataPda(feeClaimer);
		const pda2 = derivePartnerMetadataPda(otherFeeClaimer);

		expect(pda1.equals(pda2)).toBe(false);
	});

	test('deriveVirtualPoolMetadataPda derives PDA deterministically', () => {
		const pda = deriveVirtualPoolMetadataPda(virtualPool);

		const [expected] = PublicKey.findProgramAddressSync(
			[Buffer.from('virtual_pool_metadata'), virtualPool.toBuffer()],
			new PublicKey(METEORA_DBC_PROGRAM_ID)
		);

		expect(pda.equals(expected)).toBe(true);
	});

	test('deriveVirtualPoolMetadataPda returns same result for same input', () => {
		const pda1 = deriveVirtualPoolMetadataPda(virtualPool);
		const pda2 = deriveVirtualPoolMetadataPda(virtualPool);

		expect(pda1.equals(pda2)).toBe(true);
	});

	test('deriveVirtualPoolMetadataPda returns different PDAs for different virtual pools', () => {
		const otherPool = new PublicKey('Fj8j9XScg8jB5TfF5fPK3Qw8pGC66oi7A9phei9anez9');
		const pda1 = deriveVirtualPoolMetadataPda(virtualPool);
		const pda2 = deriveVirtualPoolMetadataPda(otherPool);

		expect(pda1.equals(pda2)).toBe(false);
	});
});

describe('AppStoreService', () => {
	const feeClaimer = new PublicKey('Fj8j9XScg8jB5TfF5fPK3Qw8pGC66oi7A9phei9anez9');
	const virtualPool = new PublicKey('So11111111111111111111111111111111111111112');
	const connection = new Connection('https://api.mainnet-beta.solana.com', 'processed');
	const service = new AppStoreService('test-api-key', connection);

	test('service derivePartnerMetadataPda delegates to utility and matches', () => {
		const fromService = service.derivePartnerMetadataPda(feeClaimer);
		const fromUtil = derivePartnerMetadataPda(feeClaimer);

		expect(fromService.equals(fromUtil)).toBe(true);
	});

	test('service deriveVirtualPoolMetadataPda delegates to utility and matches', () => {
		const fromService = service.deriveVirtualPoolMetadataPda(virtualPool);
		const fromUtil = deriveVirtualPoolMetadataPda(virtualPool);

		expect(fromService.equals(fromUtil)).toBe(true);
	});
});
