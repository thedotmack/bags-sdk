# App Store API Guide

The Bags App Store is a marketplace where **partners** list services that token creators can add as fee shareholders. Partners like DividendsBot, Compound Liquidity, and DEX Boosts register their branding, and token creators attach them to their tokens to automatically route a percentage of trading fees to those services.

This guide covers the two roles:

1. **Partners** — Register your service so token creators can discover and add it
2. **Token creators** — Set display metadata on your token's virtual pool

## Quick Start

```typescript
import { BagsSDK } from '@bagsfm/bags-sdk';
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=YOUR_KEY');
const sdk = new BagsSDK('your-bags-api-key', connection, 'confirmed');
```

---

## For Partners: List Your Service in the App Store

If you're building a service (a bot, a tool, a social integration) and want token creators to be able to add you as a fee shareholder, you need to register partner metadata on-chain.

### Register your service

Your service identity is tied to a **fee claimer** wallet — the same wallet that will receive trading fees when token creators add your service. The metadata you set here (name, website, logo) is what appears in the App Store UI.

```typescript
const feeClaimerKeypair = Keypair.fromSecretKey(/* your service wallet */);

const instruction = await sdk.appStore.buildCreatePartnerMetadataInstruction({
  payer: feeClaimerKeypair.publicKey,
  feeClaimer: feeClaimerKeypair.publicKey,
  name: 'DividendsBot',
  website: 'https://dividendsbot.com',
  logo: 'https://dividendsbot.com/logo.png',
});

const tx = new Transaction().add(instruction);
await sendAndConfirmTransaction(connection, tx, [feeClaimerKeypair]);
```

The fee claimer wallet must sign the transaction. This is the same wallet you use when token creators configure fee sharing — it links your App Store listing to your fee share configuration.

### Check if your service is already registered

```typescript
const feeClaimer = new PublicKey('your-fee-claimer-wallet');
const metadata = await sdk.appStore.getPartnerMetadata(feeClaimer);

if (metadata) {
  console.log('Listed as:', metadata.name);
  console.log('Website:', metadata.website);
  console.log('Logo:', metadata.logo);
} else {
  console.log('Not registered yet');
}
```

### Look up the on-chain address for your listing

If you need the PDA address (e.g. for on-chain verification or debugging), you can derive it without an RPC call:

```typescript
const pda = sdk.appStore.derivePartnerMetadataPda(feeClaimer);
```

Or use the standalone utility:

```typescript
import { derivePartnerMetadataPda } from '@bagsfm/bags-sdk';
const pda = derivePartnerMetadataPda(feeClaimer);
```

---

## For Token Creators: Set Your Token's Pool Metadata

When you launch a token on Bags, it creates a virtual pool. You can attach display metadata (name, website, logo) to that pool. This is separate from the token's SPL metadata — it describes the project behind the token.

### Set metadata on your pool

Only the wallet that originally created the pool can set its metadata. The creator is verified automatically from the pool's on-chain data — you just need to sign the transaction with the same wallet.

```typescript
const creatorKeypair = Keypair.fromSecretKey(/* the wallet that launched the token */);
const virtualPool = new PublicKey('your-virtual-pool-address');

const instruction = await sdk.appStore.buildCreateVirtualPoolMetadataInstruction({
  payer: creatorKeypair.publicKey,
  virtualPool,
  name: 'My Token Project',
  website: 'https://myproject.xyz',
  logo: 'https://myproject.xyz/logo.png',
});

const tx = new Transaction().add(instruction);
await sendAndConfirmTransaction(connection, tx, [creatorKeypair]);
```

### Read existing pool metadata

```typescript
const virtualPool = new PublicKey('...');
const metadata = await sdk.appStore.getVirtualPoolMetadata(virtualPool);

if (metadata) {
  console.log('Project:', metadata.name);
  console.log('Website:', metadata.website);
  console.log('Logo:', metadata.logo);
} else {
  console.log('No metadata set for this pool');
}
```

### Look up the on-chain address

```typescript
const pda = sdk.appStore.deriveVirtualPoolMetadataPda(virtualPool);
```

---

## How It All Fits Together

The App Store metadata works alongside the existing **partner** and **fee share** services in the SDK. Here's the typical flow:

```
1. Partner registers in App Store         →  sdk.appStore.buildCreatePartnerMetadataInstruction()
2. Partner creates a fee config account   →  sdk.partner.getPartnerConfigCreationTransaction()
3. Token creator launches a token         →  sdk.tokenLaunch.launchToken()
4. Creator adds partners as fee sharers   →  sdk.config.createBagsFeeShareConfig()
5. Trading fees accumulate to partners    →  (automatic)
6. Partner claims earned fees             →  sdk.partner.getPartnerConfigClaimTransactions()
```

The App Store metadata (step 1) is the **branding layer** — it gives partners a name, logo, and website so they show up in the Bags UI. The partner config (step 2) is the **financial layer** — it tracks accumulated and claimed fees.

---

## Type Reference

### `CreatePartnerMetadataParams`

| Field        | Type        | Description                                |
|--------------|-------------|--------------------------------------------|
| `payer`      | `PublicKey`  | Wallet funding the account creation        |
| `feeClaimer` | `PublicKey`  | Fee claimer wallet (must sign)             |
| `name`       | `string`     | Service name shown in the App Store        |
| `website`    | `string`     | Service website URL                        |
| `logo`       | `string`     | Service logo URL                           |

### `CreateVirtualPoolMetadataParams`

| Field         | Type        | Description                                |
|---------------|-------------|--------------------------------------------|
| `payer`       | `PublicKey`  | Wallet funding the account creation        |
| `virtualPool` | `PublicKey`  | The virtual pool address                   |
| `name`        | `string`     | Project name                               |
| `website`     | `string`     | Project website URL                        |
| `logo`        | `string`     | Project logo URL                           |

### `DecodedPartnerMetadata`

Returned by `getPartnerMetadata()`:

| Field        | Type        | Description                      |
|--------------|-------------|----------------------------------|
| `feeClaimer` | `PublicKey`  | The fee claimer wallet           |
| `name`       | `string`     | Service name                     |
| `website`    | `string`     | Service website                  |
| `logo`       | `string`     | Service logo URL                 |

### `DecodedVirtualPoolMetadata`

Returned by `getVirtualPoolMetadata()`:

| Field         | Type        | Description                     |
|---------------|-------------|---------------------------------|
| `virtualPool` | `PublicKey`  | The virtual pool address        |
| `name`        | `string`     | Project name                    |
| `website`     | `string`     | Project website                 |
| `logo`        | `string`     | Project logo URL                |
