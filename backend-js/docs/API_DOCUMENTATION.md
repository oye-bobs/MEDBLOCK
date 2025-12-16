# MEDBLOCK API Documentation

Complete API reference for the MEDBLOCK backend services.

**Base URL:** `http://localhost:8000/api` (development)

---

## 📑 Quick Reference

### All Available APIs

| Category | Endpoint | Method | Authentication | Frontend Usage | Purpose |
|----------|----------|--------|----------------|----------------|---------|
| **Identity** | `/identity/patient/create` | POST | ❌ None | Patient Registration | Create new patient with wallet |
| **Identity** | `/identity/login-wallet` | POST | ❌ None | Wallet Login | Check if wallet exists |
| **Identity** | `/identity/did/create` | POST | ❌ None | Generic DID Creation | Create DID for patient/provider |
| **Identity** | `/identity/did/:did` | GET | ❌ None | DID Resolution | Get DID document |
| **Identity** | `/identity/authenticate` | POST | ❌ None | Wallet Authentication | Sign message & get JWT |
| **Identity** | `/identity/profile` | GET | ✅ DID/JWT | User Profile | Get logged-in user data |
| **Consent** | `/consent/grant` | POST | ✅ DID | Grant Access | Patient grants provider access |
| **Consent** | `/consent/:id/revoke` | POST | ✅ DID | Revoke Access | Patient revokes consent |
| **Consent** | `/consent/active` | GET | ✅ DID | View Consents | List all active consents |
| **Records** | `/records/observations` | POST | ✅ DID | Create Record | Provider creates observation |
| **Records** | `/records/observations/:id` | GET | ✅ DID | View Record | Get specific observation |
| **Records** | `/records/observations/patient/:did` | GET | ✅ DID | Patient Records | Get all patient observations |

---

## 🎯 Frontend Integration

### API Service Location
**File:** `frontend/patient-portal/src/services/api.ts`

The frontend uses a singleton `ApiService` class that automatically handles:
- Base URL configuration
- DID authentication headers
- Request/response formatting
- Error handling

### Usage in React Components

```typescript
import { apiService } from '@/services/api'

// In your component
const handleRegister = async () => {
  try {
    const patient = await apiService.createPatientDID({
      name: [{use: 'official', family: 'Okafor', given: ['Chinonso']}],
      gender: 'male',
      birth_date: '1990-05-15',
      walletAddress: walletAddress
    })
    
    console.log('Patient created:', patient.did)
  } catch (error) {
    console.error('Registration failed:', error)
  }
}
```

### Available Frontend Methods

```typescript
// Identity & Authentication
apiService.createPatientDID(data)      // Register new patient
apiService.checkWallet(walletAddress)  // Check if wallet exists
apiService.resolveDID(did)             // Get DID document
apiService.getProfile()                // Get current user profile

// Medical Records
apiService.getObservations(patientId)  // Get patient observations
apiService.getObservation(id)          // Get specific observation
apiService.createObservation(data)     // Create new observation

// Consent Management
apiService.grantConsent({              // Grant provider access
  provider_did: 'did:prism:...',
  duration_hours: 24,
  scope: ['read:observations']
})
apiService.revokeConsent(consentId)    // Revoke access
apiService.getActiveConsents()         // List active consents

// Access Logs
apiService.getAccessLog(patientDid)    // Get audit trail
```

---

## 🔐 Authentication

Most endpoints require DID-based authentication using custom headers:

```
Authorization: DID {did} signature:{signature}
X-DID-Message: {original_message}
```

The frontend `apiService` automatically adds these headers from localStorage.

---

## 📋 API Endpoints

### 🆔 Identity Management (`/identity`)

#### 1. Create Patient DID
**POST** `/identity/patient/create`

Create a new patient identity with DID and wallet integration.

**Request Body:**
```json
{
  "name": [
    {
      "use": "official",
      "family": "Okafor",
      "given": ["Chinonso", "Michael"]
    }
  ],
  "gender": "male",
  "birth_date": "1990-05-15",
  "telecom": [
    {
      "system": "phone",
      "value": "+2348012345678",
      "use": "mobile"
    },
    {
      "system": "email",
      "value": "chinonso@example.com"
    }
  ],
  "address": [
    {
      "use": "home",
      "line": ["123 Herbert Macaulay Way"],
      "city": "Lagos",
      "state": "Lagos",
      "postalCode": "100001",
      "country": "Nigeria"
    }
  ],
  "walletAddress": "addr1qy..."
}
```

**Response:**
```json
{
  "did": "did:prism:...",
  "patient_id": "uuid-...",
  "publicKey": "...",
  "privateKey": "..."
}
```

---

#### 2. Login with Wallet
**POST** `/identity/login-wallet`

Check if a wallet address is already registered and get the associated DID.

**Request Body:**
```json
{
  "walletAddress": "addr1qy..."
}
```

**Response:**
```json
{
  "did": "did:prism:...",
  "patient_id": "uuid-..."
}
```

**Error Response (404):**
```json
{
  "error": "Wallet not found"
}
```

---

#### 3. Create Generic DID
**POST** `/identity/did/create`

Create a generic DID (for patients or providers).

**Request Body:**
```json
{
  "type": "patient" // or "provider"
}
```

**Response:**
```json
{
  "did": "did:prism:...",
  "publicKey": "...",
  "privateKey": "..."
}
```

---

#### 4. Resolve DID
**GET** `/identity/did/:did`

Get the DID document for a specific DID.

**Parameters:**
- `did` - The DID to resolve

**Response:**
```json
{
  "@context": ["https://www.w3.org/ns/did/v1"],
  "id": "did:prism:...",
  "verificationMethod": [...],
  "authentication": [...]
}
```

---

#### 5. Authenticate with DID
**POST** `/identity/authenticate`

Authenticate using DID signature and get a JWT token.

**Request Body:**
```json
{
  "did": "did:prism:...",
  "message": "Login to MEDBLOCK at 2025-12-07T10:30:00Z",
  "signature": "...",
  "role": "patient"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 6. Get Profile
**GET** `/identity/profile`

Get the authenticated user's profile.

**Headers:**
- `Authorization: Bearer {jwt_token}` or DID headers

**Response:**
```json
{
  "did": "did:prism:...",
  "role": "patient",
  // Additional profile data
}
```

---

### 🤝 Consent Management (`/consent`)

**Note:** All consent endpoints require DID authentication.

#### 1. Grant Consent
**POST** `/consent/grant`

Grant access consent to a healthcare provider.

**Request Body:**
```json
{
  "providerDid": "did:prism:provider123...",
  "scope": ["read:observations", "read:medications"],
  "durationHours": 24
}
```

**Response:**
```json
{
  "consentId": "uuid-...",
  "patientDid": "did:prism:...",
  "providerDid": "did:prism:provider123...",
  "scope": ["read:observations", "read:medications"],
  "expiresAt": "2025-12-08T10:30:00Z",
  "transactionHash": "0x...",
  "status": "active"
}
```

---

#### 2. Revoke Consent
**POST** `/consent/:id/revoke`

Revoke a previously granted consent.

**Parameters:**
- `id` - Consent ID

**Response:**
```json
{
  "consentId": "uuid-...",
  "status": "revoked",
  "revokedAt": "2025-12-07T11:00:00Z",
  "transactionHash": "0x..."
}
```

---

#### 3. Get Active Consents
**GET** `/consent/active`

Get all active consents for the authenticated patient.

**Response:**
```json
[
  {
    "consentId": "uuid-...",
    "providerDid": "did:prism:provider123...",
    "providerName": "Dr. Adebayo's Clinic",
    "scope": ["read:observations", "read:medications"],
    "grantedAt": "2025-12-07T10:30:00Z",
    "expiresAt": "2025-12-08T10:30:00Z",
    "status": "active"
  }
]
```

---

### 📊 Medical Records (`/records`)

**Note:** All record endpoints require DID authentication and check consent.

#### 1. Create Observation
**POST** `/records/observations`

Create a new medical observation (vitals, lab results, etc.).

**Request Body:**
```json
{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "85354-9",
        "display": "Blood pressure"
      }
    ]
  },
  "subject": {
    "reference": "Patient/did:prism:..."
  },
  "valueQuantity": {
    "value": 120,
    "unit": "mmHg"
  },
  "effectiveDateTime": "2025-12-07T09:00:00Z"
}
```

**Response:**
```json
{
  "id": "uuid-...",
  "transactionHash": "0x...",
  "recordHash": "sha256:...",
  "created": "2025-12-07T11:00:00Z"
}
```

---

#### 2. Get Observation
**GET** `/records/observations/:id`

Get a specific observation by ID (requires consent or ownership).

**Parameters:**
- `id` - Observation ID

**Response:**
```json
{
  "id": "uuid-...",
  "resourceType": "Observation",
  "status": "final",
  "code": {...},
  "subject": {...},
  "valueQuantity": {...},
  "effectiveDateTime": "2025-12-07T09:00:00Z",
  "meta": {
    "recordHash": "sha256:...",
    "transactionHash": "0x...",
    "verified": true
  }
}
```

---

#### 3. Get Patient Observations
**GET** `/records/observations/patient/:did`

Get all observations for a specific patient (requires consent or ownership).

**Parameters:**
- `did` - Patient DID

**Response:**
```json
[
  {
    "id": "uuid-...",
    "resourceType": "Observation",
    "status": "final",
    "code": {...},
    "effectiveDateTime": "2025-12-07T09:00:00Z"
  },
  {
    "id": "uuid-...",
    "resourceType": "Observation",
    "status": "final",
    "code": {...},
    "effectiveDateTime": "2025-12-06T14:30:00Z"
  }
]
```

---

## 🗄️ Database Entities

### Patient
- FHIR R4 compliant
- Fields: `id`, `did`, `name`, `gender`, `birthDate`, `telecom`, `address`, `walletAddress`, `active`

### Practitioner
- Healthcare provider information
- Fields: `id`, `did`, `name`, `qualification`, `telecom`, `active`

### Observation
- Medical measurements and lab results
- Fields: `id`, `patientDid`, `code`, `value`, `effectiveDateTime`, `status`, `recordHash`

### ConsentRecord
- Patient consent to provider access
- Fields: `id`, `patientDid`, `providerDid`, `scope`, `grantedAt`, `expiresAt`, `status`, `transactionHash`

### AccessLog
- Immutable audit trail
- Fields: `id`, `patientDid`, `accessorDid`, `resourceType`, `resourceId`, `action`, `timestamp`, `transactionHash`

### DiagnosticReport
- Lab results and imaging reports
- FHIR R4 compliant

### Encounter
- Patient-provider interactions
- FHIR R4 compliant

### MedicationRequest
- Prescriptions
- FHIR R4 compliant

---

## 🔒 Security Features

### Encryption
- **Algorithm:** AES-256-GCM
- **Key Management:** Per-patient encryption keys stored securely
- **Data:** All PHI is encrypted at rest

### Blockchain Verification
- **Hashing:** SHA-256 for data integrity
- **Storage:** Transaction hashes on Cardano blockchain
- **Verification:** All records can be verified against blockchain

### Access Control
- **DID Authentication:** All requests require valid DID signature
- **Consent Checking:** Automatic consent verification for data access
- **Audit Logging:** All access attempts logged immutably

---

## 🌐 CORS Configuration

The API supports CORS for the following origins:
- `http://localhost:3000` (Patient Portal)
- `http://localhost:3001` (Provider Portal)
- `http://localhost:3002` (HMO Portal)

---

## 📝 Error Responses

### Standard Error Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Error Codes
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid auth)
- `403` - Forbidden (no consent)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 Environment Variables

Set these in `backend-js/.env`:

```env
# Database
DATABASE_TYPE=sqlite
DATABASE_DATABASE=medblock.db

# Blockchain
CARDANO_NETWORK=preview
BLOCKFROST_API_KEY=your_key_here

# JWT
JWT_SECRET=your_secret_here

# Encryption
ENCRYPTION_KEY=your_256bit_key_here

# Server
PORT=8000
```

---

## 🧪 Testing the API

### Using cURL

**Create Patient:**
```bash
curl -X POST http://localhost:8000/api/identity/patient/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": [{"use": "official", "family": "Test", "given": ["Patient"]}],
    "gender": "male",
    "walletAddress": "addr1test..."
  }'
```

**Login with Wallet:**
```bash
curl -X POST http://localhost:8000/api/identity/login-wallet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "addr1test..."}'
```

### Using Frontend API Service

```typescript
import { apiService } from './services/api'

// Create patient
const patient = await apiService.createPatientDID({
  name: [{use: 'official', family: 'Okafor', given: ['Chinonso']}],
  gender: 'male',
  walletAddress: 'addr1...'
})

// Check wallet
const existing = await apiService.checkWallet('addr1...')

// Grant consent
const consent = await apiService.grantConsent({
  provider_did: 'did:prism:provider...',
  duration_hours: 24
})
```

---

## 📊 Swagger Documentation

Interactive API documentation is available at:
- **URL:** `http://localhost:8000/api`
- **Format:** OpenAPI 3.0 (Swagger UI)

---

**Last Updated:** December 7, 2025  
**API Version:** 1.0  
**Status:** Development (MVP)
