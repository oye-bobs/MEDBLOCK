# MEDBLOCK Implementation Plan

Build a production-ready Electronic Medical Records (EMR) system on Cardano blockchain with hybrid on-chain/off-chain architecture for secure, patient-owned healthcare data.

## User Review Required

> [!IMPORTANT]
> **Technology Stack Decisions**
> - **Backend**: Python (Django/FastAPI) for FHIR compliance and healthcare integrations
> - **Smart Contracts**: Plutus for consent management, Marlowe for insurance claims
> - **Identity**: Atala PRISM for self-sovereign patient identity (DIDs)
> - **Database**: PostgreSQL with encryption-at-rest for off-chain PHI storage
> - **Cardano Network**: Starting with **Preprod Testnet**, migration path to Mainnet
> - **Blockchain Interaction**: PyCardano library for Python-Cardano integration

> [!WARNING]
> **Regulatory Compliance Requirements**
> This implementation plan assumes:
> - HIPAA compliance for US operations (if applicable)
> - Nigeria Data Protection Regulation (NDPR) compliance
> - Patient consent is legally binding via blockchain signatures
> 
> **Legal review required before production deployment**

> [!CAUTION]
> **Security Considerations**
> - Private keys for patient DIDs must be securely managed (hardware wallets recommended for production)
> - Off-chain database requires enterprise-grade encryption (AES-256)
> - Smart contracts must undergo professional security audit before mainnet deployment

---

## Proposed Changes

### Phase 1: Infrastructure & Development Environment

#### [NEW] Project Structure
```
MEDBLOCK/
├── backend/                    # Django/FastAPI backend
│   ├── api/                   # REST API endpoints
│   ├── blockchain/            # Cardano integration
│   ├── fhir/                  # FHIR data models
│   └── identity/              # Atala PRISM integration
├── contracts/                 # Plutus/Marlowe smart contracts
│   ├── consent/              # Patient consent contracts
│   └── claims/               # Insurance claims contracts
├── frontend/                  # Patient & Provider portals
│   ├── patient-portal/       # React patient interface
│   └── provider-portal/      # React provider interface
├── infrastructure/            # DevOps & deployment
│   ├── docker/               # Docker configurations
│   └── cardano-node/         # Cardano node setup
└── docs/                      # Documentation
```

#### [NEW] [docker-compose.yml](file:///c:/Users/dell/Documents/MEDBLOCK/docker-compose.yml)
Multi-container setup including:
- **Cardano Node** (Preprod testnet sync)
- **PostgreSQL** (encrypted off-chain storage)
- **Backend API** (Django/FastAPI)
- **Redis** (caching & session management)
- **Frontend** (Nginx serving React apps)

#### [NEW] [.env.example](file:///c:/Users/dell/Documents/MEDBLOCK/.env.example)
Environment configuration template:
- Cardano network parameters (testnet/mainnet)
- Database credentials
- Encryption keys
- Atala PRISM API credentials
- FHIR server endpoints

---

### Phase 2: Cardano Smart Contracts

#### [NEW] [contracts/consent/patient_consent.plutus](file:///c:/Users/dell/Documents/MEDBLOCK/contracts/consent/patient_consent.plutus)
**Plutus Smart Contract** for patient consent management:
- **Inputs**: Patient DID, Provider DID, Record Hash, Expiration Time
- **Logic**: 
  - Verify patient signature
  - Grant time-bound access to specific records
  - Auto-revoke after expiration
  - Emit access grant event to blockchain
- **Outputs**: Consent token (NFT) representing active permission

#### [NEW] [contracts/claims/insurance_claim.marlowe](file:///c:/Users/dell/Documents/MEDBLOCK/contracts/claims/insurance_claim.marlowe)
**Marlowe Contract** for automated insurance claims:
- **Inputs**: Patient DID, Procedure Code, Record Hash, HMO Policy ID
- **Logic**:
  1. Verify patient identity via DID
  2. Check procedure code against policy coverage
  3. Validate record hash exists on-chain
  4. Calculate payment amount
  5. Trigger payment to provider wallet
- **Outputs**: Payment transaction + claim settlement record

#### [NEW] [contracts/lib/metadata_schema.json](file:///c:/Users/dell/Documents/MEDBLOCK/contracts/lib/metadata_schema.json)
Transaction metadata schema (CIP-20 compliant):
```json
{
  "recordHash": "SHA-256 hash of FHIR resource",
  "recordType": "Diagnosis | Lab | Imaging | Prescription",
  "patientDID": "did:prism:patient_identifier",
  "providerDID": "did:prism:provider_identifier",
  "timestamp": "ISO 8601 timestamp",
  "accessLog": "Encrypted access event"
}
```

---

### Phase 3: Backend API & Blockchain Integration

#### [NEW] [backend/requirements.txt](file:///c:/Users/dell/Documents/MEDBLOCK/backend/requirements.txt)
Core dependencies:
- `Django==4.2` / `FastAPI==0.104` (API framework)
- `pycardano==0.9.0` (Cardano blockchain interaction)
- `fhir.resources==7.0` (FHIR R4 data models)
- `cryptography==41.0` (AES encryption for PHI)
- `psycopg2-binary==2.9` (PostgreSQL driver)
- `atala-prism-sdk` (DID management)

#### [NEW] [backend/blockchain/cardano_client.py](file:///c:/Users/dell/Documents/MEDBLOCK/backend/blockchain/cardano_client.py)
Cardano blockchain client:
- Connect to Cardano node (via PyCardano)
- Submit transactions with metadata (record hashes)
- Query blockchain for access logs
- Verify transaction confirmations
- Handle wallet management for system operations

#### [NEW] [backend/blockchain/hash_manager.py](file:///c:/Users/dell/Documents/MEDBLOCK/backend/blockchain/hash_manager.py)
Hash generation and verification:
- Generate SHA-256 hashes of FHIR resources
- Store hash-to-record mappings
- Verify record integrity on retrieval
- Detect tampering by comparing hashes

#### [NEW] [backend/identity/prism_integration.py](file:///c:/Users/dell/Documents/MEDBLOCK/backend/identity/prism_integration.py)
Atala PRISM integration:
- Create patient DIDs (self-sovereign identities)
- Issue verifiable credentials (immunization, blood type, etc.)
- Verify DID signatures for authentication
- Manage credential revocation

#### [NEW] [backend/api/endpoints/records.py](file:///c:/Users/dell/Documents/MEDBLOCK/backend/api/endpoints/records.py)
Medical records API:
- `POST /records` - Create new record (hash to blockchain)
- `GET /records/{id}` - Retrieve record (verify consent + hash)
- `GET /records/audit/{patient_id}` - Access audit trail from blockchain
- `POST /records/share` - Grant consent via smart contract

#### [NEW] [backend/api/endpoints/consent.py](file:///c:/Users/dell/Documents/MEDBLOCK/backend/api/endpoints/consent.py)
Consent management API:
- `POST /consent/grant` - Execute consent smart contract
- `POST /consent/revoke` - Revoke access permission
- `GET /consent/active` - List active consents for patient

#### [NEW] [backend/fhir/models.py](file:///c:/Users/dell/Documents/MEDBLOCK/backend/fhir/models.py)
FHIR R4 compliant data models:
- Patient resource
- Observation (lab results)
- DiagnosticReport (imaging, tests)
- MedicationRequest (prescriptions)
- Encounter (visits)

---

### Phase 4: Atala PRISM Identity Layer

#### [NEW] [backend/identity/did_manager.py](file:///c:/Users/dell/Documents/MEDBLOCK/backend/identity/did_manager.py)
DID lifecycle management:
- Generate new DIDs for patients/providers
- Store DID documents on Cardano
- Resolve DIDs to public keys
- Update DID documents (key rotation)

#### [NEW] [backend/identity/credential_issuer.py](file:///c:/Users/dell/Documents/MEDBLOCK/backend/identity/credential_issuer.py)
Verifiable credentials issuance:
- Issue "Proof of Immunization" credentials
- Issue "Blood Type Verified" credentials
- Issue "Medical License" credentials (for providers)
- Sign credentials with issuer DID

#### [NEW] [backend/identity/auth_middleware.py](file:///c:/Users/dell/Documents/MEDBLOCK/backend/identity/auth_middleware.py)
DID-based authentication:
- Verify DID signatures on API requests
- Challenge-response authentication flow
- Session management with DID-linked tokens

---

### Phase 5: Frontend Applications

#### [NEW] [frontend/patient-portal/](file:///c:/Users/dell/Documents/MEDBLOCK/frontend/patient-portal/)
**Patient Portal** (React + TypeScript):
- **Dashboard**: View medical history, upcoming appointments
- **Records Viewer**: Browse FHIR resources with hash verification status
- **Consent Manager**: Grant/revoke provider access with smart contracts
- **Wallet Integration**: Connect Cardano wallet (Nami, Eternl) for DID signing
- **Audit Log**: View blockchain access history

#### [NEW] [frontend/provider-portal/](file:///c:/Users/dell/Documents/MEDBLOCK/frontend/provider-portal/)
**Provider Portal** (React + TypeScript):
- **Patient Lookup**: Search by DID or credentials
- **Records Access**: Request consent, view authorized records
- **Record Creation**: Add diagnoses, lab results (auto-hash to blockchain)
- **Claims Submission**: Trigger Marlowe insurance contracts
- **Verification**: Real-time hash verification indicators

#### [NEW] [frontend/shared/components/WalletConnect.tsx](file:///c:/Users/dell/Documents/MEDBLOCK/frontend/shared/components/WalletConnect.tsx)
Cardano wallet integration component:
- Detect installed wallets (Nami, Eternl, Flint)
- Connect wallet and retrieve addresses
- Sign transactions for consent/access
- Display ADA balance and network status

---

### Phase 6: DevOps & Deployment

#### [NEW] [infrastructure/docker/cardano-node/Dockerfile](file:///c:/Users/dell/Documents/MEDBLOCK/infrastructure/docker/cardano-node/Dockerfile)
Cardano node container:
- Based on `inputoutput/cardano-node:8.7.3`
- Configured for Preprod testnet
- Persistent volume for blockchain data
- Exposed ports for node API

#### [NEW] [infrastructure/docker/backend/Dockerfile](file:///c:/Users/dell/Documents/MEDBLOCK/infrastructure/docker/backend/Dockerfile)
Backend API container:
- Python 3.11 base image
- Install dependencies from requirements.txt
- Run Django migrations
- Gunicorn WSGI server

#### [NEW] [infrastructure/kubernetes/](file:///c:/Users/dell/Documents/MEDBLOCK/infrastructure/kubernetes/)
Kubernetes manifests for production (optional):
- Deployments for backend, frontend, Cardano node
- Services and Ingress for routing
- Secrets for encryption keys and credentials
- PersistentVolumeClaims for database and blockchain data

---

## Verification Plan

### Automated Tests

#### Smart Contract Testing
```bash
# Plutus contract simulation
cd contracts/consent
cabal test patient-consent-tests

# Marlowe contract validation
marlowe-cli run analyze --contract insurance_claim.marlowe
```

#### Backend Integration Tests
```bash
# Test Cardano transaction submission
pytest backend/tests/test_blockchain_integration.py

# Test FHIR resource hashing
pytest backend/tests/test_hash_manager.py

# Test DID authentication
pytest backend/tests/test_prism_auth.py
```

#### End-to-End Tests
```bash
# Simulate patient consent flow
npm run test:e2e -- consent-flow.spec.ts

# Simulate record creation and verification
npm run test:e2e -- record-creation.spec.ts
```

---

### Manual Verification

#### 1. Cardano Testnet Verification
- [ ] Verify Cardano node is synced to Preprod testnet
- [ ] Submit test transaction with metadata
- [ ] Query transaction on [Cardano Explorer (Preprod)](https://preprod.cardanoscan.io/)
- [ ] Verify metadata is readable and correct

#### 2. DID Creation & Authentication
- [ ] Create patient DID via API
- [ ] Verify DID document on Cardano blockchain
- [ ] Test authentication with DID signature
- [ ] Issue test verifiable credential

#### 3. Record Hashing & Integrity
- [ ] Create FHIR Observation resource
- [ ] Verify hash is generated and stored on-chain
- [ ] Modify off-chain record
- [ ] Confirm hash mismatch detection

#### 4. Consent Smart Contract
- [ ] Deploy consent contract to testnet
- [ ] Grant access from patient wallet
- [ ] Verify provider can access record
- [ ] Wait for expiration and confirm auto-revocation

#### 5. Insurance Claims (Marlowe)
- [ ] Deploy claims contract with test policy
- [ ] Submit claim with valid record hash
- [ ] Verify automatic payment execution
- [ ] Test rejection for invalid procedure codes

#### 6. Frontend Wallet Integration
- [ ] Connect Nami wallet to patient portal
- [ ] Sign consent transaction
- [ ] Verify transaction appears in wallet history
- [ ] Test with multiple wallet providers

---

## Implementation Timeline

### Week 1-2: Infrastructure Setup
- Set up project structure
- Configure Docker environment
- Deploy Cardano node (testnet sync)
- Set up PostgreSQL with encryption

### Week 3-4: Smart Contracts
- Develop Plutus consent contract
- Develop Marlowe claims contract
- Test on Cardano testnet
- Deploy to testnet

### Week 5-7: Backend Development
- Implement Cardano client
- Build FHIR data models
- Create hash management system
- Integrate Atala PRISM

### Week 8-10: Frontend Development
- Build patient portal
- Build provider portal
- Implement wallet integration
- Create consent UI

### Week 11-12: Testing & Security
- Comprehensive testing
- Security audit
- Performance optimization
- Documentation

---

## Next Steps After Approval

1. **Set up development environment** (Docker, Cardano node)
2. **Create project structure** with all directories
3. **Implement Cardano client** for blockchain interaction
4. **Develop first smart contract** (patient consent)
5. **Build core API endpoints** for record management

---

## Questions for Consideration

1. **Cardano Wallet**: Should we provide a built-in wallet for patients, or require external wallets (Nami, Eternl)?
2. **HMO Integration**: Do you have specific HMO partners in Nigeria with APIs we should integrate?
3. **FHIR Server**: Should we build a custom FHIR server or integrate with existing solutions (HAPI FHIR)?
4. **Scaling**: What's the expected transaction volume (records/day) for initial deployment?
