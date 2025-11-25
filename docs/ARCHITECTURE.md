# MEDBLOCK Architecture Documentation

## System Overview

MEDBLOCK is a blockchain-based Electronic Medical Records (EMR) system built on Cardano that provides secure, patient-owned healthcare data management through a hybrid on-chain/off-chain architecture.

## Architecture Principles

### 1. Hybrid Data Storage

**On-Chain (Cardano Blockchain)**:
- Cryptographic hashes of medical records (SHA-256)
- Access permissions and consent records
- Audit trail of all data access events
- Patient and provider DIDs (Decentralized Identifiers)
- Smart contract state (consent, claims)

**Off-Chain (PostgreSQL)**:
- Actual FHIR-compliant medical records (encrypted)
- Patient demographic information
- Provider credentials
- Appointment schedules
- Binary medical data (images, PDFs)

### 2. Trust Model

```
┌─────────────────────────────────────────────────────────┐
│                    Patient (DID Owner)                   │
│                 Controls Private Key                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Signs Transactions
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Cardano Blockchain (Trust Layer)            │
│  • Record Hashes (Proof of Existence)                   │
│  • Access Permissions (Smart Contracts)                 │
│  • Audit Logs (Immutable)                               │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Hash Verification
                         ▼
┌─────────────────────────────────────────────────────────┐
│          Off-Chain Database (Data Layer)                 │
│  • Encrypted FHIR Resources                             │
│  • Released only if:                                     │
│    1. Valid DID signature                               │
│    2. Active consent smart contract                     │
│    3. Hash matches blockchain record                    │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Backend API Layer

```
┌──────────────────────────────────────────────────────────┐
│                     Django REST API                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   FHIR      │  │  Blockchain  │  │   Identity     │ │
│  │   Module    │  │   Client     │  │   (PRISM)      │ │
│  │             │  │ (PyCardano)  │  │                │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   Hash      │  │  Encryption  │  │   Access       │ │
│  │  Manager    │  │   Service    │  │   Control      │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Smart Contract Layer

**Plutus Consent Contract**:
```haskell
-- Simplified representation
data ConsentDatum = ConsentDatum
  { patientDID :: DID
  , providerDID :: DID
  , recordHash :: ByteString
  , expirationTime :: POSIXTime
  , accessLevel :: AccessLevel
  }

-- Validator ensures:
-- 1. Patient signature present
-- 2. Current time < expiration
-- 3. Provider matches authorized DID
```

**Marlowe Claims Contract**:
```
When patient submits claim:
  If (patient_verified AND procedure_covered AND record_exists):
    Pay provider
    Record settlement
  Else:
    Reject claim
    Notify patient
```

## Data Flow Diagrams

### Creating a Medical Record

```
Provider Portal
      │
      │ 1. Create FHIR Resource
      ▼
Backend API
      │
      ├─► 2. Generate SHA-256 Hash
      │
      ├─► 3. Encrypt Record (AES-256)
      │
      ├─► 4. Store in PostgreSQL
      │
      └─► 5. Submit Hash to Cardano
              │
              ▼
          Cardano Blockchain
              │
              └─► Transaction Metadata:
                  {
                    "recordHash": "abc123...",
                    "patientDID": "did:prism:...",
                    "recordType": "diagnosis",
                    "timestamp": "2025-11-25T16:00:00Z"
                  }
```

### Accessing a Medical Record

```
Provider Portal
      │
      │ 1. Request Record Access
      ▼
Backend API
      │
      ├─► 2. Check Consent Contract
      │       │
      │       ▼
      │   Cardano Blockchain
      │       │
      │       └─► Is consent active?
      │               │
      │               ├─► YES: Continue
      │               └─► NO: Reject
      │
      ├─► 3. Verify Provider DID
      │
      ├─► 4. Retrieve Encrypted Record
      │       │
      │       ▼
      │   PostgreSQL
      │
      ├─► 5. Decrypt Record
      │
      ├─► 6. Verify Hash
      │       │
      │       ▼
      │   Compare with Blockchain Hash
      │       │
      │       ├─► MATCH: Return Record
      │       └─► MISMATCH: Alert Tampering
      │
      └─► 7. Log Access Event to Blockchain
```

### Granting Consent

```
Patient Portal
      │
      │ 1. Connect Cardano Wallet (Nami/Eternl)
      ▼
Wallet Extension
      │
      │ 2. Select Provider & Records
      ▼
Backend API
      │
      │ 3. Build Consent Contract Transaction
      │    - Patient DID (from wallet)
      │    - Provider DID
      │    - Record hashes
      │    - Expiration time (e.g., 72 hours)
      ▼
Wallet Extension
      │
      │ 4. Patient Signs Transaction
      ▼
Cardano Blockchain
      │
      │ 5. Deploy Consent Smart Contract
      │    - Creates NFT representing permission
      │    - Sets auto-expiration
      ▼
Provider Notified
      │
      └─► Can now access records until expiration
```

## Security Architecture

### Encryption Layers

1. **Transport Layer**: TLS 1.3 for all API communication
2. **Database Layer**: AES-256 encryption at rest for PHI
3. **Application Layer**: Field-level encryption for sensitive data
4. **Blockchain Layer**: Public key cryptography (Ed25519) for DIDs

### Authentication Flow

```
User (Patient/Provider)
      │
      │ 1. Connect Wallet
      ▼
Frontend
      │
      │ 2. Request Challenge
      ▼
Backend API
      │
      │ 3. Generate Random Challenge
      │    "Sign this: 0x1234abcd..."
      ▼
Wallet
      │
      │ 4. Sign Challenge with Private Key
      ▼
Backend API
      │
      │ 5. Verify Signature with DID Public Key
      │    (Resolve DID from Cardano)
      │
      ├─► VALID: Issue JWT Token
      └─► INVALID: Reject
```

### Access Control Matrix

| Role | Create Record | View Own Records | View Others' Records | Grant Consent | Revoke Consent | Process Claims |
|------|--------------|------------------|---------------------|---------------|----------------|----------------|
| **Patient** | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Provider** | ✅ | ✅ | ✅ (with consent) | ❌ | ❌ | ❌ |
| **HMO** | ❌ | ❌ | ✅ (claims only) | ❌ | ❌ | ✅ |
| **Admin** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (system) |

## Scalability Considerations

### Transaction Volume Management

- **Batching**: Group multiple record hashes into single Cardano transaction
- **Off-Peak Submission**: Queue non-urgent transactions for lower fee periods
- **Layer 2 (Future)**: Consider Hydra for high-frequency access logs

### Database Sharding

```
Patient Records (Sharded by Patient DID)
├── Shard 1: DIDs starting with 0-3
├── Shard 2: DIDs starting with 4-7
├── Shard 3: DIDs starting with 8-B
└── Shard 4: DIDs starting with C-F
```

### Caching Strategy

- **Redis**: Cache active consent contracts (TTL = expiration time)
- **CDN**: Cache public provider profiles and credentials
- **Application**: Cache DID resolution results (1 hour TTL)

## Compliance & Regulatory

### HIPAA Compliance (if applicable)

- ✅ Access controls (DID-based authentication)
- ✅ Audit trails (immutable blockchain logs)
- ✅ Encryption at rest and in transit
- ✅ Patient consent management
- ✅ Data integrity verification (hashes)

### Nigeria Data Protection Regulation (NDPR)

- ✅ Data subject rights (patient owns DID/keys)
- ✅ Consent management (smart contracts)
- ✅ Data portability (FHIR standard)
- ✅ Right to be forgotten (off-chain deletion, hash remains)

## Disaster Recovery

### Backup Strategy

1. **Blockchain Data**: Inherently redundant (distributed ledger)
2. **Off-Chain Database**: 
   - Daily encrypted backups to cloud storage
   - Point-in-time recovery enabled
   - Geographic redundancy (multi-region)
3. **Encryption Keys**: 
   - Hardware Security Module (HSM) storage
   - Key rotation every 90 days

### Recovery Procedures

- **Database Corruption**: Restore from backup, verify hashes against blockchain
- **Blockchain Node Failure**: Sync from network (data always available)
- **Key Compromise**: Revoke DID, issue new credentials, re-encrypt data

## Future Enhancements

1. **Zero-Knowledge Proofs**: Prove record attributes without revealing data
2. **Hydra State Channels**: Instant, low-cost access log transactions
3. **Cross-Chain Interoperability**: Bridge to other healthcare blockchains
4. **AI/ML Integration**: Privacy-preserving analytics on encrypted data
5. **Mobile SDKs**: Native iOS/Android apps with biometric authentication

## References

- [Cardano Documentation](https://docs.cardano.org/)
- [Atala PRISM](https://atalaprism.io/)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [PyCardano Library](https://pycardano.readthedocs.io/)
