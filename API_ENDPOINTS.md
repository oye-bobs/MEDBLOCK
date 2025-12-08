# MEDBLOCK API Endpoints Documentation

This document provides a comprehensive list of all backend API endpoints used by both the **Patient Portal** and **Provider Portal** frontends.

## Base URL

```
Default: http://localhost:8000/api
Production: Set via VITE_API_URL environment variable
```

## Authentication

All authenticated endpoints require DID-based authentication with the following headers:

```http
Authorization: DID {did} signature:{signature}
X-DID-Message: {message}
```

The DID credentials (did, signature, message) are stored in localStorage after authentication.

---

## 1. Identity Endpoints

### 1.1 Create Patient DID
**Endpoint:** `POST /api/identity/patient/create/`  
**Authentication:** None (Public)  
**Used By:** Patient Portal (Registration)

**Request Body:**
```json
{
  "name": [
    {
      "given": ["John"],
      "family": "Doe"
    }
  ],
  "gender": "male",
  "birth_date": "1990-01-01",
  "telecom": [
    {
      "system": "phone",
      "value": "+1234567890"
    },
    {
      "system": "email",
      "value": "john.doe@example.com"
    }
  ],
  "address": [
    {
      "line": ["123 Main St"],
      "city": "New York",
      "state": "NY",
      "postalCode": "10001"
    }
  ]
}
```

**Response:**
```json
{
  "patient_id": "uuid",
  "did": "did:medblock:patient:...",
  "public_key": "...",
  "private_key": "...",
  "warning": "Store your private key securely. It cannot be recovered if lost."
}
```

---

### 1.2 Create Provider DID
**Endpoint:** `POST /api/identity/provider/create/`  
**Authentication:** None (Public)  
**Used By:** Provider Portal (Registration)

**Request Body:**
```json
{
  "name": [
    {
      "given": ["Dr. Jane"],
      "family": "Smith"
    }
  ],
  "gender": "female",
  "telecom": [
    {
      "system": "email",
      "value": "dr.smith@hospital.com"
    }
  ],
  "address": [
    {
      "line": ["456 Hospital Ave"],
      "city": "Boston",
      "state": "MA",
      "postalCode": "02101"
    }
  ],
  "qualification": [
    {
      "code": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0360",
            "code": "MD",
            "display": "Doctor of Medicine"
          }
        ]
      }
    }
  ]
}
```

**Response:**
```json
{
  "practitioner_id": "uuid",
  "did": "did:medblock:provider:...",
  "public_key": "...",
  "private_key": "...",
  "warning": "Store your private key securely. It cannot be recovered if lost."
}
```

---

### 1.3 Resolve DID
**Endpoint:** `GET /api/identity/resolve/`  
**Authentication:** None (Public)  
**Used By:** Both Portals

**Query Parameters:**
- `did` (required): The DID to resolve

**Example:**
```
GET /api/identity/resolve/?did=did:medblock:patient:abc123
```

**Response:**
```json
{
  "id": "did:medblock:patient:abc123",
  "publicKey": [...],
  "authentication": [...],
  "service": [...]
}
```

---

### 1.4 Get Profile
**Endpoint:** `GET /api/identity/profile/`  
**Authentication:** Required (DID)  
**Used By:** Both Portals

**Response (Patient):**
```json
{
  "type": "patient",
  "id": "uuid",
  "did": "did:medblock:patient:...",
  "name": [
    {
      "given": ["John"],
      "family": "Doe"
    }
  ],
  "gender": "male",
  "birth_date": "1990-01-01"
}
```

**Response (Provider):**
```json
{
  "type": "provider",
  "id": "uuid",
  "did": "did:medblock:provider:...",
  "name": [
    {
      "given": ["Dr. Jane"],
      "family": "Smith"
    }
  ],
  "qualification": [...]
}
```

---

## 2. Medical Records Endpoints

### 2.1 Create Observation
**Endpoint:** `POST /api/observations/`  
**Authentication:** Required (DID)  
**Used By:** Provider Portal

**Request Body:**
```json
{
  "patient_id": "uuid",
  "practitioner_id": "uuid",
  "status": "final",
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "8867-4",
        "display": "Heart rate"
      }
    ],
    "text": "Heart rate"
  },
  "value_quantity": {
    "value": 72,
    "unit": "beats/minute",
    "system": "http://unitsofmeasure.org"
  },
  "effective_datetime": "2024-12-08T10:30:00Z"
}
```

**Response:**
```json
{
  "id": "uuid",
  "blockchain_hash": "sha256_hash...",
  "blockchain_tx_id": "cardano_tx_id...",
  "status": "success"
}
```

---

### 2.2 Get Observation by ID
**Endpoint:** `GET /api/observations/{id}/`  
**Authentication:** Required (DID)  
**Used By:** Both Portals

**Response:**
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "status": "final",
  "code": {
    "coding": [...],
    "text": "Heart rate"
  },
  "value_quantity": {
    "value": 72,
    "unit": "beats/minute",
    "system": "http://unitsofmeasure.org"
  },
  "effective_datetime": "2024-12-08T10:30:00Z",
  "blockchain_hash": "sha256_hash...",
  "blockchain_tx_id": "cardano_tx_id...",
  "hash_verified": true
}
```

**Notes:**
- Verifies consent before allowing access
- Checks hash integrity against blockchain
- Logs access to blockchain
- Returns 403 if no active consent exists

---

### 2.3 Get Patient Observations
**Endpoint:** `GET /api/observations/patient_observations/`  
**Authentication:** Required (DID)  
**Used By:** Both Portals

**Query Parameters:**
- `patient_id` (required): UUID of the patient

**Example:**
```
GET /api/observations/patient_observations/?patient_id=uuid
```

**Response:**
```json
{
  "count": 5,
  "observations": [
    {
      "id": "uuid",
      "code": {
        "coding": [...],
        "text": "Heart rate"
      },
      "status": "final",
      "effective_datetime": "2024-12-08T10:30:00Z",
      "blockchain_hash": "sha256_hash..."
    },
    ...
  ]
}
```

**Notes:**
- Requires active consent if accessor is not the patient
- Returns observations ordered by effective_datetime (most recent first)

---

## 3. Consent Management Endpoints

### 3.1 Grant Consent
**Endpoint:** `POST /api/consents/grant/`  
**Authentication:** Required (DID - Patient only)  
**Used By:** Patient Portal

**Request Body:**
```json
{
  "provider_did": "did:medblock:provider:...",
  "duration_hours": 72,
  "scope": ["all"]
}
```

**Parameters:**
- `provider_did` (required): DID of the healthcare provider
- `duration_hours` (optional): Duration in hours (default: 72)
- `scope` (optional): Array of scopes (default: ["all"])

**Response:**
```json
{
  "consent_id": "uuid",
  "status": "active",
  "expires_at": "2024-12-11T10:30:00Z",
  "smart_contract_address": "addr_test1_consent_...",
  "consent_tx_id": "consent_tx_...",
  "scope": ["all"]
}
```

**Notes:**
- Deploys a Plutus smart contract on Cardano blockchain
- Only the patient can grant consent
- Creates an immutable consent record

---

### 3.2 Revoke Consent
**Endpoint:** `POST /api/consents/{consent_id}/revoke/`  
**Authentication:** Required (DID - Patient only)  
**Used By:** Patient Portal

**Response:**
```json
{
  "consent_id": "uuid",
  "status": "revoked",
  "revoked_at": "2024-12-08T15:30:00Z"
}
```

**Notes:**
- Only the patient who granted consent can revoke it
- Updates the smart contract on blockchain
- Returns 403 if requester is not the patient

---

### 3.3 Get Active Consents
**Endpoint:** `GET /api/consents/active/`  
**Authentication:** Required (DID)  
**Used By:** Both Portals

**Response:**
```json
{
  "role": "patient",
  "count": 2,
  "consents": [
    {
      "id": "uuid",
      "patient_did": "did:medblock:patient:...",
      "provider_did": "did:medblock:provider:...",
      "granted_at": "2024-12-08T10:00:00Z",
      "expires_at": "2024-12-11T10:00:00Z",
      "scope": ["all"],
      "smart_contract_address": "addr_test1_consent_..."
    },
    ...
  ]
}
```

**Notes:**
- Returns different consents based on user role:
  - **Patient**: Consents granted by the patient
  - **Provider**: Consents granted to the provider
- Only returns active, non-expired consents

---

## 4. Access Log Endpoints

### 4.1 Get Access Logs
**Endpoint:** `GET /api/access-logs/`  
**Authentication:** Required (DID)  
**Used By:** Patient Portal

**Query Parameters:**
- `patient_did` (required): DID of the patient

**Example:**
```
GET /api/access-logs/?patient_did=did:medblock:patient:abc123
```

**Response:**
```json
{
  "count": 10,
  "logs": [
    {
      "id": "uuid",
      "accessor_did": "did:medblock:provider:...",
      "patient_did": "did:medblock:patient:...",
      "resource_type": "Observation",
      "resource_id": "uuid",
      "action": "read",
      "accessed_at": "2024-12-08T14:30:00Z",
      "blockchain_tx_id": "cardano_tx_..."
    },
    ...
  ]
}
```

**Notes:**
- All access events are logged to the blockchain
- Provides full audit trail of who accessed what data and when
- Immutable and tamper-proof

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Description of what went wrong"
}
```

### 403 Forbidden
```json
{
  "error": "No active consent for accessing this record"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Data integrity check failed - record may have been tampered with"
}
```

---

## Frontend Implementation

### Patient Portal (`patient-portal/src/services/api.ts`)

The patient portal uses the following endpoints:

1. **Identity**
   - `createPatientDID()` → POST `/api/identity/patient/create/`
   - `resolveDID()` → GET `/api/identity/resolve/`
   - `getProfile()` → GET `/api/identity/profile/`

2. **Medical Records**
   - `getObservations()` → GET `/api/observations/patient_observations/`
   - `getObservation()` → GET `/api/observations/{id}/`
   - `createObservation()` → POST `/api/observations/`

3. **Consent**
   - `grantConsent()` → POST `/api/consents/grant/`
   - `revokeConsent()` → POST `/api/consents/{id}/revoke/`
   - `getActiveConsents()` → GET `/api/consents/active/`

4. **Access Logs**
   - `getAccessLog()` → GET `/api/access-logs/`

### Provider Portal

The provider portal currently does not have a dedicated API service file. It should implement the following endpoints:

1. **Identity**
   - POST `/api/identity/provider/create/` (Registration)
   - GET `/api/identity/profile/` (Get provider profile)

2. **Medical Records**
   - POST `/api/observations/` (Create patient records)
   - GET `/api/observations/patient_observations/` (View patient records with consent)
   - GET `/api/observations/{id}/` (View specific observation)

3. **Consent**
   - GET `/api/consents/active/` (View consents granted to provider)

---

## Demo Mode

The patient portal supports a demo mode controlled by the `VITE_DEMO` environment variable. When set to `'true'`, all API calls are intercepted and return mock data from `src/mock/demoData.ts`.

---

## Security Features

1. **DID-based Authentication**: All authenticated requests use decentralized identifiers
2. **Consent Verification**: Medical records can only be accessed with active patient consent
3. **Blockchain Integrity**: All records are hashed and stored on Cardano blockchain
4. **Access Logging**: Every data access is logged immutably on the blockchain
5. **Hash Verification**: Data integrity is verified against blockchain hashes on retrieval

---

## Next Steps for Provider Portal

To fully integrate the provider portal with the backend, create a new file:

**`provider-portal/src/services/api.ts`**

This should implement the same ApiService class structure as the patient portal, with methods for:
- Creating provider DIDs
- Searching for patients
- Creating medical records
- Viewing consents granted to the provider
- Accessing patient records (with consent verification)

---

## Environment Variables

### Patient Portal (`.env`)
```env
VITE_API_URL=http://localhost:8000/api
VITE_DEMO=false
```

### Provider Portal (`.env`)
```env
VITE_API_URL=http://localhost:8000/api
VITE_DEMO=false
```

---

## Additional Notes

- All timestamps are in ISO 8601 format
- All IDs are UUIDs
- The blockchain integration uses Cardano testnet
- Smart contracts are written in Plutus
- FHIR resources follow HL7 FHIR R4 specification
