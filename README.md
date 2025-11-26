# MEDBLOCK
## Nigeria's Blockchain-Secured National EMR Infrastructure

> Rebuilding Nigeria's healthcare data backbone with blockchain technology

[![Cardano](https://img.shields.io/badge/Blockchain-Cardano-blue)](https://cardano.org)
[![FHIR R4](https://img.shields.io/badge/Standard-FHIR%20R4-green)](https://hl7.org/fhir/)
[![License](https://img.shields.io/badge/License-TBD-yellow)]()

---

## 🇳🇬 The Problem

Nigeria's healthcare system faces critical challenges:

- **85% of medical records are paper-based** or siloed in isolated systems
- **Billions lost annually** to fraudulent HMO insurance claims
- **Zero nationwide data exchange** between hospitals, labs, and clinics
- **Repeated diagnostics** waste resources and delay treatment
- **No real-time disease surveillance** for NCDC and government agencies

**Result:** Inefficient healthcare delivery, preventable deaths, and massive fraud.

---

## 💡 The Solution

**MEDBLOCK** is a blockchain-backed national EMR infrastructure that:

✅ **Eliminates fraud** - Immutable blockchain fingerprints for every medical record  
✅ **Enables interoperability** - FHIR-compliant data exchange across all providers  
✅ **Empowers patients** - Self-sovereign identity and data ownership  
✅ **Automates claims** - Smart contracts process HMO claims in <5 minutes  
✅ **Provides insights** - Real-time anonymized data for government policy  

---

## 🏗️ Architecture

**Hybrid On-Chain/Off-Chain Design:**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Blockchain** | Cardano (Preprod) | Record hashes, consent, audit trail |
| **Smart Contracts** | Plutus + Marlowe | Consent management, claims automation |
| **Identity** | Atala PRISM | Self-sovereign DIDs (linked to NIN) |
| **Backend** | Django + PyCardano | REST API, business logic |
| **Database** | PostgreSQL | Encrypted off-chain medical records |
| **Standard** | FHIR R4 | Interoperability across providers |
| **Frontend** | React + TypeScript | Patient & provider portals |

---

## 🎯 Key Features

### For Patients
- **Own your medical data** via Cardano wallet and DID
- **Grant time-bound access** to doctors (24h, 72h, 1 week, 30 days)
- **View complete audit trail** of who accessed your records
- **Access records anywhere** in Nigeria with MEDBLOCK Health ID

### For Hospitals & Clinics
- **Instant patient history** from any hospital in Nigeria
- **No repeated tests** - lab results automatically shared
- **Cross-hospital transfers** with complete medical records
- **Faster insurance payments** via automated claims

### For HMOs (Insurance Companies)
- **Fraud elimination** - Verify procedures on blockchain
- **Claims processed in <5 minutes** (vs. weeks)
- **Reduced operational costs** - Automated verification
- **Lower premiums** - Savings passed to customers

### For Diagnostic Labs
- **Direct patient delivery** - Results instantly available
- **Blockchain verification** - Tamper-proof lab reports
- **Duplicate test prevention** - Save patients money

### For Government (NCDC, NHIA, State Ministries)
- **Real-time disease surveillance** - Track outbreaks as they happen
- **Verified health data** - No manipulation possible
- **Evidence-based policy** - Make decisions with confidence
- **Budget optimization** - Allocate resources effectively

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+
- Python 3.11+
- Cardano wallet (Nami/Eternl) for testing

### 1. Setup
```bash
git clone <repository-url>
cd MEDBLOCK
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start Infrastructure
```bash
docker-compose up -d
# Wait for Cardano node to sync (may take hours on first run)
```

### 3. Run Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 4. Run Patient Portal
```bash
cd frontend/patient-portal
npm install
npm run dev
```

### 5. Access
- **Patient Portal**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

---

## 🧪 Frontend Testing (Demo Mode — No Backend Required)

You can run the patient and provider portals locally in demo mode without starting the backend or Docker. This uses the built-in mock data and demo API handlers.

1) Patient portal (port 3000)

```bash
cd frontend/patient-portal
# Enable demo mode (already provided in repo):
# create or verify `.env` contains:
# VITE_DEMO=true
# VITE_API_URL=http://localhost:8000/api   # optional when using demo mode
npm install
npm run dev
```

Open: http://localhost:3000

2) Provider portal (port 3001)

```bash
cd frontend/provider-portal
# Create `.env` with:
# VITE_DEMO=true
# VITE_API_URL=http://localhost:8000/api
# REACT_APP_API_URL=http://localhost:8000
npm install
npm run dev
```

Open: http://localhost:3001

Notes
- The patient portal uses `import.meta.env.VITE_DEMO` to switch to mocked API responses. Setting `VITE_DEMO=true` forces demo data from `frontend/patient-portal/src/mock/demoData`.
- The provider portal `dev` script is configured to run on port 3001. Run it in a separate terminal so the patient portal on port 3000 is not stopped.
- To change ports temporarily, append `-- --port <port>` to `npm run dev`.
- If you want the frontend to proxy requests to a running backend, set `VITE_API_URL` (and `REACT_APP_API_URL` for the proxy) to the backend URL and restart the dev server.

Troubleshooting
- If the app doesn't pick up `.env` changes, stop the dev server and restart it.
- If a port is in use, run `lsof -i :3000` (mac/linux) or use Task Manager on Windows to free the port, or run on a different port.

This flow lets you test UI flows, consent screens, and mock records without running the Django backend or blockchain services.

---

## 📊 Use Cases

### 1. Emergency Room Visit
Patient arrives unconscious → ER doctor looks up DID → Instant access to allergies, medications, conditions → Life-saving treatment → Complete audit trail

### 2. Cross-Hospital Transfer
General Hospital Lagos → LUTH specialist care → No repeated tests → Complete medical history available → Faster specialized treatment

### 3. HMO Fraud Prevention
Hospital submits fake surgery claim → HMO queries blockchain → No matching records found → Claim rejected automatically → ₦450,000 saved

### 4. Disease Surveillance
COVID-19 test uploaded → Anonymized data to NCDC → Real-time outbreak detection → Targeted public health response

### 5. Telemedicine
Rural Sokoto patient → Lagos specialist via video → Complete medical history available → Accurate diagnosis → E-prescription verified on blockchain

---

## 🔐 Security & Privacy

- **AES-256 encryption** for all off-chain patient data
- **SHA-256 hashing** for blockchain integrity verification
- **DID-based authentication** - No passwords to steal
- **NDPR compliant** - Nigerian Data Protection Regulation
- **Time-bound consent** - Auto-revocation after expiration
- **Immutable audit trail** - Every access logged on blockchain

---

## 📁 Project Structure

```
MEDBLOCK/
├── backend/                    # Django REST API
│   ├── api/                   # Endpoints (records, consent, identity)
│   ├── blockchain/            # Cardano client (PyCardano)
│   ├── fhir/                  # FHIR R4 models
│   ├── identity/              # Atala PRISM DID management
│   └── core/                  # Encryption, utilities
├── frontend/
│   ├── patient-portal/        # React patient app
│   └── provider-portal/       # React provider app (planned)
├── contracts/                  # Smart contracts (planned)
│   ├── consent/              # Plutus consent contracts
│   └── claims/               # Marlowe insurance claims
├── infrastructure/
│   ├── docker/               # Docker configurations
│   └── cardano-node/         # Cardano node setup
└── docs/                      # Comprehensive documentation
    ├── IMPLEMENTATION_PLAN.md
    ├── WORKFLOWS_AND_USE_CASES.md
    ├── GAP_ANALYSIS.md
    └── WALKTHROUGH.md
```

---

## 📚 Documentation

Comprehensive documentation available in [`/docs`](./docs/):

- **[Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)** - Technical architecture & roadmap
- **[Workflows & Use Cases](./docs/WORKFLOWS_AND_USE_CASES.md)** - Nigerian-specific scenarios
- **[Gap Analysis](./docs/GAP_ANALYSIS.md)** - Current status vs. full vision
- **[Walkthrough](./docs/WALKTHROUGH.md)** - What's built & how to run it
- **[Architecture](./docs/ARCHITECTURE.md)** - Detailed system design
- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup & development workflow

---

## 📈 Current Status

**Implementation: ~35-40% Complete**

### ✅ Production-Ready
- Blockchain core (Cardano integration, hashing, verification)
- FHIR R4 compliant data models
- AES-256 encryption
- Immutable audit trail
- Django REST API
- Docker infrastructure

### ⚠️ In Progress
- Patient portal (UI ready, wallet integration needs fixing)
- DID authentication (working with mock PRISM)
- Consent management (API ready, needs Plutus contracts)

### 🔜 Next Priorities
1. Fix Mesh SDK wallet integration
2. Build provider portal
3. Implement Plutus consent smart contracts
4. Create demo data for stakeholder presentations
5. Deploy to Cardano testnet

---

## 🎯 Roadmap

### Phase 1: MVP (Current)
- ✅ Core blockchain integration
- ✅ FHIR-compliant backend
- ⚠️ Patient portal
- 🔜 Provider portal
- 🔜 Basic smart contracts

### Phase 2: Pilot (Q1 2025)
- Deploy to 2-3 private hospitals in Lagos
- Onboard 1,000 patients
- Test HMO claims automation
- Government stakeholder demos

### Phase 3: Expansion (Q2-Q3 2025)
- Add government hospitals (LUTH, UCH, UNTH)
- Integrate major HMOs (Hygeia, Avon, Reliance)
- Expand to diagnostic labs (Synlab, Clina-Lancet)
- NCDC disease surveillance integration

### Phase 4: Nationwide (Q4 2025 - 2026)
- Rollout to all 36 states
- NHIA partnership for universal coverage
- NIN integration for all Nigerians
- Become de facto national EMR standard

---

## 💼 Business Model

- **₦150-₦500** per verified record access
- **1.5%** fee for automated insurance claims
- **Enterprise licensing** for large hospital groups
- **Government partnerships** (NIN/BVN model)
- **International donor support** (World Bank, Global Fund)

---

## 🤝 Stakeholders

- **Patients** - 200M+ Nigerians
- **Hospitals** - 30,000+ facilities nationwide
- **HMOs** - 60+ registered insurance companies
- **Labs** - 5,000+ diagnostic centers
- **Government** - NHIA, NCDC, NPHCDA, State Ministries
- **Telemedicine** - Growing digital health sector

---

## 🌍 Impact

- 🇳🇬 **First nationwide EMR in Nigeria**
- 🇳🇬 **Eliminate 85% of paper-based records**
- 🇳🇬 **Save billions in annual fraud**
- 🇳🇬 **Improve healthcare outcomes**
- 🇳🇬 **Position Nigeria as African healthtech leader**

---

## 📞 Contact

For inquiries about MEDBLOCK:
- **Technical**: See [Development Guide](./docs/DEVELOPMENT.md)
- **Partnerships**: [Contact information TBD]
- **Government**: [Contact information TBD]

---

## 📄 License

[To be determined]

---

**Built with ❤️ for Nigeria's healthcare transformation on Cardano**

*Powered by blockchain. Secured by cryptography. Owned by patients.*
