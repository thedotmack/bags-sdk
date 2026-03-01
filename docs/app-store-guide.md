# App Store API Guide

The `AppStoreService` lets you create and read on-chain metadata for **partners** and **virtual pools** on the Meteora Dynamic Bonding Curve program. This metadata is stored as PDAs (Program Derived Addresses) and includes display info like name, website, and logo.

## Setup

```typescript
import { BagsSDK } from '@bagsfm/bags-sdk';
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=YOUR_KEY');
const sdk = new BagsSDK('your-bags-api-key', connection, 'confirmed');

// Access the service
const appStore = sdk.appStore;
```

## Partner Metadata

Partner metadata is keyed by a **fee claimer** public key. Each fee claimer can have exactly one partner metadata account on-chain.

### Derive a Partner Metadata PDA

Compute the PDA address without making any RPC calls:

```typescript
const feeClaimer = new PublicKey('...');
const pda = appStore.derivePartnerMetadataPda(feeClaimer);
console.log('Partner metadata PDA:', pda.toBase58());
```

You can also use the standalone utility directly:

```typescript
import { derivePartnerMetadataPda } from '@bagsfm/bags-sdk';

const pda = derivePartnerMetadataPda(feeClaimer);
```

### Read Partner Metadata

Fetch the on-chain account data. Returns `null` if no metadata has been created yet:

```typescript
const metadata = await appStore.getPartnerMetadata(feeClaimer);

if (metadata) {
  console.log('Partner name:', metadata.name);
  console.log('Website:', metadata.website);
  console.log('Logo:', metadata.logo);
  console.log('Fee claimer:', metadata.feeClaimer.toBase58());
} else {
  console.log('No metadata found for this partner');
}
```

### Create Partner Metadata

Build a transaction instruction to create partner metadata on-chain. The `feeClaimer` must sign the transaction:

```typescript
const feeClaimerKeypair = Keypair.fromSecretKey(/* ... */);
const payer = feeClaimerKeypair.publicKey; // can be any funded wallet

const instruction = await appStore.buildCreatePartnerMetadataInstruction({
  payer,
  feeClaimer: feeClaimerKeypair.publicKey,
  name: 'My Partner App',
  website: 'https://example.com',
  logo: 'https://example.com/logo.png',
});

// Add to a transaction and send
const tx = new Transaction().add(instruction);
await sendAndConfirmTransaction(connection, tx, [feeClaimerKeypair]);
```

## Virtual Pool Metadata

Virtual pool metadata is keyed by a **virtual pool** public key. Only the pool's original creator can create metadata for it.

### Derive a Virtual Pool Metadata PDA

```typescript
const virtualPool = new PublicKey('...');
const pda = appStore.deriveVirtualPoolMetadataPda(virtualPool);
console.log('Pool metadata PDA:', pda.toBase58());
```

Or use the standalone utility:

```typescript
import { deriveVirtualPoolMetadataPda } from '@bagsfm/bags-sdk';

const pda = deriveVirtualPoolMetadataPda(virtualPool);
```

### Read Virtual Pool Metadata

```typescript
const metadata = await appStore.getVirtualPoolMetadata(virtualPool);

if (metadata) {
  console.log('Project name:', metadata.name);
  console.log('Website:', metadata.website);
  console.log('Logo:', metadata.logo);
  console.log('Virtual pool:', metadata.virtualPool.toBase58());
} else {
  console.log('No metadata found for this pool');
}
```

### Create Virtual Pool Metadata

Build a transaction instruction to create metadata for a virtual pool. The transaction must be signed by the pool's original **creator** (resolved automatically from the pool's on-chain data):

```typescript
const creatorKeypair = Keypair.fromSecretKey(/* ... */);
const virtualPool = new PublicKey('...');

const instruction = await appStore.buildCreateVirtualPoolMetadataInstruction({
  payer: creatorKeypair.publicKey,
  virtualPool,
  name: 'My Token Project',
  website: 'https://myproject.xyz',
  logo: 'https://myproject.xyz/logo.png',
});

// The creator must sign the transaction
const tx = new Transaction().add(instruction);
await sendAndConfirmTransaction(connection, tx, [creatorKeypair]);
```

> **Note:** The `creator` account is resolved automatically by Anchor from the virtual pool's on-chain data. You do not need to pass it explicitly, but the creator's keypair must sign the transaction.

## Type Reference

### `DecodedPartnerMetadata`

```typescript
type DecodedPartnerMetadata = {
  feeClaimer: PublicKey;
  name: string;
  website: string;
  logo: string;
};
```

### `DecodedVirtualPoolMetadata`

```typescript
type DecodedVirtualPoolMetadata = {
  virtualPool: PublicKey;
  name: string;
  website: string;
  logo: string;
};
```

### `CreatePartnerMetadataParams`

```typescript
type CreatePartnerMetadataParams = {
  payer: PublicKey;       // Wallet funding account creation
  feeClaimer: PublicKey;  // Fee claimer key (must sign)
  name: string;          // Partner display name
  website: string;       // Partner website URL
  logo: string;          // Partner logo URL
};
```

### `CreateVirtualPoolMetadataParams`

```typescript
type CreateVirtualPoolMetadataParams = {
  payer: PublicKey;       // Wallet funding account creation
  virtualPool: PublicKey; // Virtual pool address
  name: string;          // Project display name
  website: string;       // Project website URL
  logo: string;          // Project logo URL
};
```

## PDA Seeds

For reference, the PDA seeds used:

- **Partner metadata:** `["partner_metadata", feeClaimer]` under the Meteora DBC program
- **Virtual pool metadata:** `["virtual_pool_metadata", virtualPool]` under the Meteora DBC program
