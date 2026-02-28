import { PublicKey } from '@solana/web3.js';

export type DecodedPartnerMetadata = {
	feeClaimer: PublicKey;
	name: string;
	website: string;
	logo: string;
};

export type DecodedVirtualPoolMetadata = {
	virtualPool: PublicKey;
	name: string;
	website: string;
	logo: string;
};

export type CreatePartnerMetadataParams = {
	/** Payer funding the account creation */
	payer: PublicKey;
	/** Fee claimer for the partner (signer) */
	feeClaimer: PublicKey;
	/** Name of the partner */
	name: string;
	/** Website of the partner */
	website: string;
	/** Logo URL of the partner */
	logo: string;
};

export type CreateVirtualPoolMetadataParams = {
	/** Payer funding the account creation */
	payer: PublicKey;
	/** The virtual pool public key */
	virtualPool: PublicKey;
	/** The pool creator (signer, must match the virtual pool's creator) */
	creator: PublicKey;
	/** Name of the project */
	name: string;
	/** Website of the project */
	website: string;
	/** Logo URL of the project */
	logo: string;
};
