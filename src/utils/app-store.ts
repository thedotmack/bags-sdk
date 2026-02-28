import { PublicKey } from '@solana/web3.js';
import { METEORA_DBC_PROGRAM_ID } from '../constants';

/**
 * Derive the PartnerMetadata PDA for a given fee claimer
 * Seeds: ["partner_metadata", feeClaimer]
 * @param feeClaimer - The fee claimer public key
 * @returns The derived PartnerMetadata PDA
 */
export function derivePartnerMetadataPda(feeClaimer: PublicKey): PublicKey {
	const [pda] = PublicKey.findProgramAddressSync([Buffer.from('partner_metadata'), feeClaimer.toBuffer()], new PublicKey(METEORA_DBC_PROGRAM_ID));
	return pda;
}

/**
 * Derive the VirtualPoolMetadata PDA for a given virtual pool
 * Seeds: ["virtual_pool_metadata", virtualPool]
 * @param virtualPool - The virtual pool public key
 * @returns The derived VirtualPoolMetadata PDA
 */
export function deriveVirtualPoolMetadataPda(virtualPool: PublicKey): PublicKey {
	const [pda] = PublicKey.findProgramAddressSync([Buffer.from('virtual_pool_metadata'), virtualPool.toBuffer()], new PublicKey(METEORA_DBC_PROGRAM_ID));
	return pda;
}
