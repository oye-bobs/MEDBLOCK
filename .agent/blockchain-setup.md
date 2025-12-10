# Blockchain Configuration Guide

## Current Status
✅ **Development Mode Active**: The application is currently running with **MOCK DIDs** because Blockfrost credentials are not configured.

This is perfectly fine for development and testing! The app will work normally, but DIDs won't be minted on the actual Cardano blockchain.

## Mock DID Format
When blockchain is unavailable, the system generates mock DIDs like:
```
did:medblock:patient:abc123xyz
did:medblock:provider:def456uvw
```

## To Enable Real Blockchain DIDs (Optional)

### 1. Get Blockfrost API Key
1. Visit [Blockfrost.io](https://blockfrost.io/)
2. Sign up for a free account
3. Create a new project (choose **Preprod** network for testing)
4. Copy your **Project ID**

### 2. Configure Environment Variables
Add these to your `backend-js/.env` file:

```env
# Cardano Blockchain Configuration
CARDANO_NETWORK=preprod
BLOCKFROST_PROJECT_ID=your_project_id_here
BLOCKFROST_URL=https://cardano-preprod.blockfrost.io/api/v0

# Optional: Backend wallet seed for signing transactions
# Generate with: cardano-cli or any Cardano wallet
CARDANO_WALLET_SEED=your_24_word_seed_phrase_here
```

### 3. Restart Backend
After adding the credentials:
```bash
cd backend-js
npm run start:dev
```

You should see:
```
[CardanoService] Cardano service initialized. Backend wallet: addr_test1...
```

## Current .env Template

Your `backend-js/.env` should have at minimum:

```env
# Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=medblock
DATABASE_SYNCHRONIZE=true
DATABASE_LOGGING=false

# Server
PORT=8000
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cardano (Optional - uses mock DIDs if not configured)
CARDANO_NETWORK=preprod
# BLOCKFROST_PROJECT_ID=
# BLOCKFROST_URL=
# CARDANO_WALLET_SEED=
```

## Verification

### Mock Mode (Current)
- ✅ DIDs are generated instantly
- ✅ No blockchain fees
- ✅ Perfect for development
- ⚠️ DIDs are not on-chain
- ⚠️ Warning message in response

### Blockchain Mode (With Blockfrost)
- ✅ Real on-chain DIDs
- ✅ Verifiable on Cardano explorer
- ✅ Production-ready
- ⚠️ Requires ADA for transaction fees
- ⚠️ Slightly slower (blockchain confirmation)

## Troubleshooting

### "Lucid not initialized" Error
**Solution**: This is expected! The app now falls back to mock DIDs automatically.

### Want to use real blockchain?
**Solution**: Follow steps 1-3 above to configure Blockfrost.

### Blockfrost rate limits?
**Solution**: Free tier has limits. Upgrade plan or use mock mode for development.

## Recommendation
For development: **Keep using mock DIDs** - it's faster and free!
For production: **Configure Blockfrost** - real blockchain verification.
