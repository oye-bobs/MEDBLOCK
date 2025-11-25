# MEDBLOCK Patient Portal

React-based patient portal for the MEDBLOCK blockchain EMR system.

## Features

- **Cardano Wallet Integration**: Connect with Nami, Eternl, or Flint wallets
- **Decentralized Identity**: Self-sovereign identity via Atala PRISM DIDs
- **Medical Records**: View FHIR-compliant records with blockchain verification
- **Consent Management**: Grant/revoke provider access via smart contracts
- **Access Audit Trail**: Immutable log of all record access on blockchain

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Mesh SDK (Cardano wallet integration)
- React Query (data fetching)
- React Router (navigation)

## Getting Started

### Prerequisites

- Node.js 18+
- A Cardano wallet browser extension (Nami, Eternl, or Flint)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── services/       # API and external services
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: http://localhost:8000/api)
- `VITE_CARDANO_NETWORK`: Cardano network (preprod/mainnet)
- `VITE_BLOCKFROST_API_KEY`: Blockfrost API key (optional)

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and select your Cardano wallet
2. **Create Profile**: Fill in your information to create a DID
3. **View Records**: Browse your medical records with blockchain verification
4. **Grant Consent**: Allow providers to access your records for a specified duration
5. **Monitor Access**: View the audit trail of who accessed your records

## Security

- Private keys are stored locally in browser localStorage
- All API requests are authenticated with DID signatures
- Medical records are encrypted off-chain
- Record hashes are verified against blockchain

## License

[To be determined]
