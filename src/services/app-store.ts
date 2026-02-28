import { Commitment, Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { BaseService } from './base';
import { derivePartnerMetadataPda, deriveVirtualPoolMetadataPda } from '../utils/app-store';
import type { CreatePartnerMetadataParams, CreateVirtualPoolMetadataParams, DecodedPartnerMetadata, DecodedVirtualPoolMetadata } from '../types/app-store';

const METADATA_PADDING_SIZE = 96;

export class AppStoreService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Derive the PartnerMetadata PDA for a given fee claimer
	 * @param feeClaimer - The fee claimer public key
	 * @returns The derived PartnerMetadata PDA address
	 */
	derivePartnerMetadataPda(feeClaimer: PublicKey): PublicKey {
		return derivePartnerMetadataPda(feeClaimer);
	}

	/**
	 * Derive the VirtualPoolMetadata PDA for a given virtual pool
	 * @param virtualPool - The virtual pool public key
	 * @returns The derived VirtualPoolMetadata PDA address
	 */
	deriveVirtualPoolMetadataPda(virtualPool: PublicKey): PublicKey {
		return deriveVirtualPoolMetadataPda(virtualPool);
	}

	/**
	 * Fetch the PartnerMetadata account for a given fee claimer
	 * @param feeClaimer - The fee claimer public key
	 * @returns The decoded PartnerMetadata account, or null if not found
	 */
	async getPartnerMetadata(feeClaimer: PublicKey): Promise<DecodedPartnerMetadata | null> {
		const pda = derivePartnerMetadataPda(feeClaimer);
		const account = await this.dbcProgram.account.partnerMetadata.fetchNullable(pda, this.commitment);

		if (!account) {
			return null;
		}

		return {
			feeClaimer: account.feeClaimer,
			name: account.name,
			website: account.website,
			logo: account.logo,
		};
	}

	/**
	 * Fetch the VirtualPoolMetadata account for a given virtual pool
	 * @param virtualPool - The virtual pool public key
	 * @returns The decoded VirtualPoolMetadata account, or null if not found
	 */
	async getVirtualPoolMetadata(virtualPool: PublicKey): Promise<DecodedVirtualPoolMetadata | null> {
		const pda = deriveVirtualPoolMetadataPda(virtualPool);
		const account = await this.dbcProgram.account.virtualPoolMetadata.fetchNullable(pda, this.commitment);

		if (!account) {
			return null;
		}

		return {
			virtualPool: account.virtualPool,
			name: account.name,
			website: account.website,
			logo: account.logo,
		};
	}

	/**
	 * Build the instruction to create partner metadata on-chain.
	 *
	 * @param params - The parameters for creating partner metadata
	 * @returns The transaction instruction
	 */
	async buildCreatePartnerMetadataInstruction(params: CreatePartnerMetadataParams): Promise<TransactionInstruction> {
		const instruction = await this.dbcProgram.methods
			.createPartnerMetadata({
				padding: new Array(METADATA_PADDING_SIZE).fill(0),
				name: params.name,
				website: params.website,
				logo: params.logo,
			})
			.accounts({
				payer: params.payer,
				feeClaimer: params.feeClaimer,
			})
			.instruction();

		return instruction;
	}

	/**
	 * Build the instruction to create virtual pool metadata on-chain.
	 *
	 * Note: The `creator` account is resolved from the virtual pool's on-chain data via Anchor relations.
	 * The transaction must still be signed by the virtual pool's creator.
	 *
	 * @param params - The parameters for creating virtual pool metadata
	 * @returns The transaction instruction
	 */
	async buildCreateVirtualPoolMetadataInstruction(params: CreateVirtualPoolMetadataParams): Promise<TransactionInstruction> {
		const instruction = await this.dbcProgram.methods
			.createVirtualPoolMetadata({
				padding: new Array(METADATA_PADDING_SIZE).fill(0),
				name: params.name,
				website: params.website,
				logo: params.logo,
			})
			.accounts({
				virtualPool: params.virtualPool,
				payer: params.payer,
			})
			.instruction();

		return instruction;
	}
}
