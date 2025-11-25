# MEDBLOCK Workflows, Use Cases & Processes
## Nigeria's Blockchain-Secured National EMR Infrastructure

## Table of Contents
1. [Core User Workflows](#core-user-workflows)
2. [Nigerian-Specific Use Cases](#nigerian-specific-use-cases)
3. [Multi-Stakeholder Workflows](#multi-stakeholder-workflows)
4. [Technical Processes](#technical-processes)
5. [Business & Compliance Processes](#business--compliance-processes)

---

## Core User Workflows

### 1. Patient Registration Workflow (with NIN Integration)

**Actors:** New Patient, Cardano Wallet, MEDBLOCK Backend, NIMC (National Identity Management Commission)

**Nigerian Context:** Integration with National Identification Number (NIN) for identity verification

**Steps:**

1. **Access Patient Portal**
   - Navigate to MEDBLOCK portal (web or mobile app)
   - See registration page

2. **Identity Verification**
   - Enter National Identification Number (NIN)
   - System verifies NIN with NIMC database
   - Retrieves basic demographics (name, DOB, gender)

3. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select wallet provider (Nami/Eternl/Flint)
   - Approve connection in wallet extension
   - System verifies wallet connection

4. **Complete Profile**
   - Confirm NIN-retrieved information
   - Add additional details:
     - Phone Number
     - Email
     - Emergency Contact
     - Blood Group
     - Genotype
     - Allergies
   - Submit form

5. **DID Creation**
   - Backend generates Decentralized Identifier (DID) via Atala PRISM
   - Format: `did:prism:ng:{hash}` (ng = Nigeria)
   - Link DID to NIN (encrypted mapping)
   - Public/private key pair generated
   - DID recorded on Cardano blockchain

6. **Authentication**
   - Sign authentication message with wallet
   - Message format: `"MEDBLOCK-NG authentication: {timestamp}"`
   - Signature stored for session management

7. **Account Created**
   - Patient ID assigned (UUID)
   - DID linked to patient record and NIN
   - Private key stored locally (user must backup!)
   - Receive MEDBLOCK Health ID card (digital + printable)
   - Redirect to dashboard

**Success Criteria:**
- ✅ Patient has unique DID linked to NIN
- ✅ Patient can access dashboard
- ✅ Profile information stored encrypted
- ✅ Health ID card generated

---

### 2. Cross-Hospital Patient Transfer Workflow

**Scenario:** Patient transfers from General Hospital Lagos to LUTH for specialized care

**Actors:** Patient, Referring Hospital, Receiving Hospital, MEDBLOCK System

**Steps:**

1. **Transfer Initiated**
   - General Hospital doctor creates transfer request
   - Includes reason for transfer
   - Attaches relevant medical records
   - Provides LUTH's provider DID

2. **Patient Notification**
   - Patient receives SMS/app notification
   - Reviews transfer details and records to be shared
   - Sees LUTH's credentials and specialization

3. **Consent Grant**
   - Patient grants 7-day consent to LUTH
   - Specifies scope: transfer-related records only
   - Emergency override option available

4. **Record Package Creation**
   - System bundles:
     - Patient demographics
     - Medical history
     - Current medications
     - Lab results (last 6 months)
     - Imaging reports
     - Allergies and vital signs
   - All records verified against blockchain hashes

5. **Secure Transfer**
   - Encrypted package sent to LUTH
   - LUTH receives notification
   - Access logged on blockchain
   - Transfer fee (₦500) charged to referring hospital

6. **LUTH Reception**
   - LUTH staff accesses patient records
   - Reviews complete medical history
   - No repeated tests needed
   - Immediate specialized care begins

7. **Post-Transfer**
   - Patient can extend consent for follow-ups
   - Or revoke after discharge
   - Both hospitals can access new records (with consent)
   - Complete audit trail maintained

**Benefits:**
- ✅ Eliminates paper-based transfers
- ✅ No repeated diagnostic tests
- ✅ Faster specialized care
- ✅ Complete medical history available
- ✅ Reduced healthcare costs

---

## Nigerian-Specific Use Cases

### Use Case 1: HMO Fraud Prevention

**Scenario:** HMO detects and prevents fraudulent insurance claim

**Actors:** Patient, Hospital, HMO (e.g., Hygeia, Avon), MEDBLOCK System

**Problem:** Hospital submits claim for surgery that never happened

**Flow:**

1. **Claim Submission**
   - Hospital submits claim for appendectomy
   - Claim amount: ₦450,000
   - Includes patient DID and procedure codes

2. **Patient Consent**
   - Patient receives notification
   - Grants limited consent to HMO
   - Scope: only appendectomy-related records
   - Duration: 14 days (claim processing period)

3. **Blockchain Verification**
   - HMO queries blockchain for:
     - Surgery record hash
     - Operating room encounter
     - Anesthesia records
     - Post-op medications
   - **Result:** No matching records found!

4. **Fraud Detection**
   - System flags claim as fraudulent
   - No blockchain evidence of surgery
   - HMO investigates hospital
   - Claim automatically rejected

5. **Audit Trail**
   - All verification steps logged
   - Hospital cannot dispute (blockchain proof)
   - Patient protected from false medical history
   - HMO saves ₦450,000

6. **Regulatory Reporting**
   - Fraud case reported to NHIA
   - Hospital flagged for investigation
   - Pattern analysis for systemic fraud

**Impact:**
- ✅ Prevents billions in annual fraud losses
- ✅ Protects patient medical records integrity
- ✅ Reduces insurance premiums
- ✅ Improves trust in healthcare system

---

### Use Case 2: Government Disease Surveillance

**Scenario:** NCDC tracks COVID-19 outbreak in real-time

**Actors:** Hospitals, Labs, NCDC, State Ministries of Health, MEDBLOCK System

**Flow:**

1. **Lab Results Upload**
   - Synlab uploads COVID-19 test result
   - Patient tests positive
   - Result automatically flagged as notifiable disease
   - Hash recorded on blockchain

2. **Anonymized Data Aggregation**
   - System removes patient identifiers
   - Retains:
     - Age group
     - Gender
     - Location (LGA level)
     - Test date
     - Variant (if sequenced)

3. **Real-Time Dashboard**
   - NCDC dashboard updates automatically
   - Shows:
     - Daily new cases by state
     - Positivity rate trends
     - Age/gender distribution
     - Geographic hotspots
   - All data blockchain-verified (no manipulation)

4. **Outbreak Detection**
   - AI detects unusual spike in Kano State
   - Alerts NCDC and Kano State Ministry of Health
   - Triggers investigation

5. **Public Health Response**
   - NCDC deploys rapid response team
   - Kano State implements targeted interventions
   - Contact tracing initiated
   - Resources allocated based on verified data

6. **Policy Planning**
   - Federal Ministry of Health uses data for:
     - Vaccine distribution planning
     - Resource allocation
     - Budget justification
   - World Bank/WHO access anonymized data

**Benefits:**
- ✅ Real-time disease surveillance
- ✅ Verified, tamper-proof data
- ✅ Faster outbreak response
- ✅ Evidence-based policy making
- ✅ International donor confidence

---

### Use Case 3: Telemedicine Consultation

**Scenario:** Patient in rural Sokoto consults specialist in Lagos via telemedicine

**Actors:** Patient (Sokoto), Telemedicine Platform, Specialist (Lagos), MEDBLOCK System

**Flow:**

1. **Consultation Request**
   - Patient books telemedicine appointment
   - Selects specialist (cardiologist in Lagos)
   - Pays consultation fee (₦5,000)

2. **Consent Grant**
   - Patient grants 24-hour consent to specialist
   - Scope: cardiovascular-related records
   - Includes recent ECG and blood pressure logs

3. **Pre-Consultation Review**
   - Specialist accesses patient records before call
   - Reviews:
     - Medical history
     - Current medications
     - Recent lab results
     - Previous cardiology reports
   - All access logged on blockchain

4. **Virtual Consultation**
   - Video call conducted
   - Specialist has complete medical context
   - No need for patient to repeat history
   - Accurate diagnosis possible

5. **Prescription & Follow-up**
   - Specialist creates e-prescription
   - Prescription hash recorded on blockchain
   - Patient can fill at any pharmacy in Nigeria
   - Follow-up appointment scheduled

6. **Local Pharmacy**
   - Patient visits pharmacy in Sokoto
   - Pharmacist verifies prescription on blockchain
   - Dispenses medication
   - Updates patient record

**Benefits:**
- ✅ Access to specialists in rural areas
- ✅ No travel costs
- ✅ Complete medical history available
- ✅ Verified prescriptions prevent fraud
- ✅ Continuity of care

---

## Multi-Stakeholder Workflows

### Workflow 1: Lab Results Integration

**Actors:** Diagnostic Lab, Patient, Hospital, MEDBLOCK System

**Scenario:** Patient gets blood test at Synlab, results automatically available to doctor

**Steps:**

1. **Lab Visit**
   - Patient visits Synlab for blood test
   - Provides MEDBLOCK Health ID
   - Lab verifies patient DID

2. **Sample Collection**
   - Lab collects sample
   - Creates lab order in MEDBLOCK
   - Links to patient DID
   - Generates unique sample ID

3. **Testing**
   - Lab performs tests
   - Results entered into MEDBLOCK system
   - System validates data format (FHIR)

4. **Results Upload**
   - Lab uploads results as Observation resource
   - System generates SHA-256 hash
   - Hash submitted to Cardano blockchain
   - Transaction ID received

5. **Patient Notification**
   - Patient receives SMS: "Lab results ready"
   - Patient views results in mobile app
   - Results include blockchain verification badge

6. **Doctor Access**
   - Patient's doctor (with active consent) sees results
   - No need for patient to bring paper results
   - Doctor can compare with previous tests
   - All access logged

7. **Duplicate Prevention**
   - If another doctor orders same test within 30 days
   - System alerts: "Recent test available"
   - Prevents unnecessary repeated tests
   - Saves patient money and time

**Benefits:**
- ✅ Instant results availability
- ✅ No lost paper reports
- ✅ Prevents duplicate tests
- ✅ Reduces healthcare costs
- ✅ Better clinical decisions

---

### Workflow 2: HMO Claims Automation

**Actors:** Patient, Hospital, HMO, Marlowe Smart Contract, MEDBLOCK System

**Scenario:** Patient undergoes surgery, claim automatically processed

**Steps:**

1. **Pre-Authorization**
   - Hospital requests pre-authorization from HMO
   - Includes procedure code and estimated cost
   - Patient grants consent to HMO

2. **HMO Verification**
   - HMO checks patient's coverage
   - Verifies procedure is covered
   - Issues pre-authorization code
   - Smart contract deployed with approval criteria

3. **Surgery Performed**
   - Hospital performs surgery
   - Creates encounter record
   - Uploads operative notes
   - Records anesthesia, medications used
   - All hashes submitted to blockchain

4. **Claim Submission**
   - Hospital submits claim with:
     - Pre-authorization code
     - Actual procedure performed
     - Itemized bill
     - Blockchain transaction IDs

5. **Smart Contract Verification**
   - Marlowe contract automatically checks:
     - ✓ Surgery record exists on blockchain
     - ✓ Procedure matches pre-authorization
     - ✓ Patient has active coverage
     - ✓ No duplicate claims
     - ✓ Cost within approved range

6. **Automated Approval**
   - If all criteria met: **Auto-approve in <5 minutes**
   - Smart contract triggers payment
   - Funds transferred to hospital's wallet
   - Patient and hospital notified

7. **Manual Review (if needed)**
   - If criteria not met: flag for adjuster
   - Adjuster reviews blockchain evidence
   - Makes decision within 24 hours
   - All decisions logged on-chain

**Benefits:**
- ✅ Claims processed in minutes (vs. weeks)
- ✅ Fraud eliminated (blockchain verification)
- ✅ Reduced administrative costs
- ✅ Faster hospital payments
- ✅ Lower insurance premiums

---

## Technical Processes

### Process 1: Hash Generation & Blockchain Verification

**Purpose:** Ensure data integrity and detect tampering

**Algorithm:** SHA-256

**Implementation:**
```python
# 1. Hash Generation (Record Creation)
data = {
    'patient_id': record.patient_id,
    'code': record.code,
    'value': record.value_quantity,
    'effective_datetime': record.effective_datetime.isoformat(),
    'status': record.status
}

# Sort keys for deterministic hashing
json_str = json.dumps(data, sort_keys=True)

# Generate SHA-256 hash
hash_value = hashlib.sha256(json_str.encode()).hexdigest()

# 2. Blockchain Submission
tx_id = cardano_client.submit_record_hash(
    record_hash=hash_value,
    record_type='observation',
    patient_did=patient.did,
    provider_did=provider.did,
    metadata={'location': 'Lagos', 'facility': 'LUTH'}
)

# 3. Hash Verification (Record Access)
current_hash = hash_manager.generate_record_hash(record)
if current_hash != record.blockchain_hash:
    raise IntegrityError("Record tampered! Alert NHIA")
```

---

### Process 2: NIN-DID Linking

**Purpose:** Link National Identity Number to Decentralized Identifier

**Privacy:** Encrypted one-way mapping

**Implementation:**
```python
# 1. NIN Verification
nin_data = nimc_api.verify_nin(nin_number)

# 2. Create DID
did_result = did_manager.create_did(entity_type='patient')

# 3. Encrypted Mapping
encrypted_nin = encryption_service.encrypt(nin_number)
mapping = NINDIDMapping.objects.create(
    encrypted_nin=encrypted_nin,
    did=did_result['did'],
    verification_date=datetime.now()
)

# 4. Blockchain Record
cardano_client.submit_metadata({
    'type': 'nin_did_mapping',
    'did': did_result['did'],
    'nin_hash': hashlib.sha256(nin_number.encode()).hexdigest(),
    'timestamp': int(time.time())
})
```

**Security:**
- ✅ NIN never stored in plain text
- ✅ Only hash on blockchain
- ✅ Reversible only with decryption key
- ✅ NDPR compliant

---

## Business & Compliance Processes

### Process 1: Transaction Fee Collection

**Fee Structure:**
- ₦150 - Basic record access
- ₦300 - Lab result upload
- ₦500 - Cross-hospital transfer
- 1.5% - Insurance claim automation

**Implementation:**
```python
# 1. Fee Calculation
def calculate_fee(transaction_type, amount=None):
    fees = {
        'record_access': 150,
        'lab_upload': 300,
        'hospital_transfer': 500,
        'insurance_claim': amount * 0.015 if amount else 0
    }
    return fees.get(transaction_type, 0)

# 2. Fee Collection
fee = calculate_fee('hospital_transfer')
payment = Payment.objects.create(
    payer=hospital,
    amount=fee,
    transaction_type='hospital_transfer',
    status='pending'
)

# 3. Blockchain Record
tx_id = cardano_client.submit_payment_proof(
    payment_id=payment.id,
    amount=fee,
    payer_did=hospital.did
)

# 4. Revenue Distribution
# 60% - Platform operations
# 20% - Cardano transaction fees
# 10% - Government health fund
# 10% - Provider incentives
```

---

### Process 2: NDPR Compliance

**Nigerian Data Protection Regulation (NDPR) Requirements:**

1. **Data Minimization**
   - Collect only necessary data
   - Delete after retention period

2. **Consent Management**
   - Explicit patient consent required
   - Granular consent (purpose-specific)
   - Easy revocation

3. **Data Localization**
   - Patient data stored in Nigerian data centers
   - Blockchain nodes in Nigeria

4. **Audit Trail**
   - All data access logged
   - Immutable blockchain records

5. **Data Subject Rights**
   - Right to access
   - Right to rectification
   - Right to erasure
   - Right to data portability

**Implementation:**
```python
# NDPR Compliance Check
def verify_ndpr_compliance(action, patient, accessor):
    # 1. Check consent
    consent = ConsentRecord.objects.filter(
        patient=patient,
        accessor=accessor,
        status='active',
        expiration__gt=datetime.now()
    ).first()
    
    if not consent:
        raise NDPRViolation("No active consent")
    
    # 2. Log access
    AccessLog.objects.create(
        patient=patient,
        accessor=accessor,
        action=action,
        timestamp=datetime.now(),
        ip_address=get_client_ip(),
        ndpr_compliant=True
    )
    
    # 3. Submit to blockchain
    cardano_client.submit_access_log(...)
```

---

## Summary

### Nigerian-Specific Features
1. **NIN Integration** - National identity verification
2. **HMO Fraud Prevention** - Blockchain-verified claims
3. **Government Surveillance** - Real-time disease tracking
4. **Cross-Hospital Transfers** - Seamless patient mobility
5. **Telemedicine** - Rural access to specialists
6. **Lab Integration** - Automated results delivery

### Stakeholder Benefits

**Patients:**
- ✅ Own and control medical data
- ✅ Access from anywhere in Nigeria
- ✅ Reduced healthcare costs
- ✅ Better quality of care

**Hospitals:**
- ✅ Instant patient history
- ✅ Faster insurance payments
- ✅ Reduced paperwork
- ✅ Interoperability with other facilities

**HMOs:**
- ✅ Fraud elimination
- ✅ Automated claims processing
- ✅ Reduced operational costs
- ✅ Lower premiums

**Government:**
- ✅ Real-time health data
- ✅ Evidence-based policy
- ✅ Disease surveillance
- ✅ Budget optimization

**Labs:**
- ✅ Direct patient delivery
- ✅ Reduced duplicate tests
- ✅ Verified results

### National Impact
- 🇳🇬 **First nationwide EMR in Nigeria**
- 🇳🇬 **Eliminates 85% of paper-based records**
- 🇳🇬 **Saves billions in fraud annually**
- 🇳🇬 **Improves healthcare outcomes**
- 🇳🇬 **Positions Nigeria as African healthtech leader**
