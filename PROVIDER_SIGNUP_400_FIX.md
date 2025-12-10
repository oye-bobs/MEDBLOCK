# Provider Signup 400 Error - Fix Applied

## Issue
Provider signup was failing with a 400 Bad Request error because of field name mismatches between frontend and backend.

## Root Cause
1. **Frontend** was sending: `name`, `hospital_name`, `hospital_type`
2. **Backend DTO** expected: `fullName`, `hospitalName`, `hospitalType`
3. **Backend DTO** was missing required fields: `hospitalType`, `password`

## Changes Made

### 1. Backend DTO Updated
**File:** `backend-js/src/identity/dto/create-practitioner.dto.ts`

Added required fields:
- ✅ `hospitalType` - Required string
- ✅ `password` - Required string
- ✅ Made `hospitalName` required (was optional)
- ✅ Made `specialty` required (was optional)

### 2. Backend Controller Updated
**File:** `backend-js/src/identity/identity.controller.ts`

Changes:
- ✅ Added password hashing using bcrypt (salt rounds: 10)
- ✅ Store hashed password in practitioner `meta` field
- ✅ Store `hospitalType` and `hospitalName` in `meta` field
- ✅ Updated qualification issuer to include hospital type
- ✅ Return `name` and `email` in response for auto-login

### 3. Frontend API Service Updated
**File:** `frontend/provider-portal/src/services/api.ts`

Changed field names to match backend:
- ❌ `name` → ✅ `fullName`
- ❌ `hospital_name` → ✅ `hospitalName`
- ❌ `hospital_type` → ✅ `hospitalType`

### 4. Frontend SignUpPage Updated
**File:** `frontend/provider-portal/src/pages/SignUpPage.tsx`

Updated API call to use correct field names:
- ✅ `fullName`
- ✅ `hospitalName`
- ✅ `hospitalType`

## Data Flow

### Frontend → Backend:
```json
{
  "fullName": "Dr. John Doe",
  "email": "doctor@hospital.com",
  "hospitalName": "General Hospital Lagos",
  "hospitalType": "General Hospital",
  "specialty": "Cardiology",
  "password": "securepassword123"
}
```

### Backend Processing:
1. Hash password with bcrypt
2. Create DID on Cardano
3. Create Practitioner entity with:
   - DID
   - Name
   - Email (in telecom)
   - Qualification (license, specialty, hospital)
   - Meta (password hash, hospital type, hospital name)

### Backend → Frontend:
```json
{
  "did": "did:medblock:provider:abc123",
  "practitioner_id": "uuid-here",
  "name": "Dr. John Doe",
  "email": "doctor@hospital.com"
}
```

## Security
- ✅ Password is hashed using bcrypt with 10 salt rounds
- ✅ Plain password never stored in database
- ✅ Hash stored in `meta` field for future authentication

## Testing
1. Fill signup form with all 7 fields
2. Submit form
3. Backend hashes password
4. Backend creates DID
5. Backend saves practitioner
6. Frontend receives DID and user info
7. Auto-login successful
8. Redirect to dashboard

## Status
✅ **FIXED** - Provider signup now works correctly with all fields!

## Files Modified
1. ✅ `backend-js/src/identity/dto/create-practitioner.dto.ts`
2. ✅ `backend-js/src/identity/identity.controller.ts`
3. ✅ `frontend/provider-portal/src/services/api.ts`
4. ✅ `frontend/provider-portal/src/pages/SignUpPage.tsx`
