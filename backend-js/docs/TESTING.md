# MEDBLOCK Testing Guide

## Backend Testing

### Setup Test Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set test environment variables
$env:DJANGO_DEBUG="True"
$env:DB_NAME="medblock_test"
$env:DB_ENCRYPTION_KEY="test_key_32_bytes_long_string_here"
```

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest backend/tests/test_basic.py

# Run specific test
pytest backend/tests/test_basic.py::HashManagerTests::test_hash_generation
```

### Manual API Testing

```bash
# Start Django development server
python manage.py runserver

# In another terminal, test endpoints:

# Create patient DID
curl -X POST http://localhost:8000/api/identity/patient/create/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": [{"given": ["John"], "family": "Doe"}],
    "gender": "male",
    "birth_date": "1990-01-01",
    "telecom": [{"system": "email", "value": "john@example.com"}]
  }'

# Resolve DID
curl "http://localhost:8000/api/identity/resolve/?did=did:prism:abc123"
```

## Frontend Testing

### Setup

```bash
cd frontend/patient-portal

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Run Development Server

```bash
# Start dev server
npm run dev

# Access at http://localhost:3000
```

### Test Wallet Integration

1. Install Nami wallet browser extension (Chrome/Edge)
2. Create testnet wallet in Nami
3. Get test ADA from Cardano testnet faucet
4. Open patient portal at http://localhost:3000/register
5. Click "Connect Wallet"
6. Select Nami
7. Approve connection
8. Fill in registration form
9. Submit to create DID

### Manual Testing Checklist

- [ ] Connect Cardano wallet (Nami/Eternl)
- [ ] Create patient DID
- [ ] View dashboard
- [ ] Check wallet balance display
- [ ] Navigate to Records page
- [ ] Navigate to Consent page
- [ ] Grant consent (enter provider DID)
- [ ] Revoke consent
- [ ] View profile page
- [ ] Logout and login again

## Integration Testing

### Test Backend + Frontend

1. Start backend: `python manage.py runserver`
2. Start frontend: `npm run dev`
3. Open browser to http://localhost:3000
4. Test full registration flow
5. Test API calls in browser DevTools Network tab

### Test Blockchain Integration (Mock)

```python
# Test hash submission
from blockchain import get_cardano_client

client = get_cardano_client()
tx_id = client.submit_record_hash(
    record_hash="abc123...",
    record_type="observation",
    patient_did="did:prism:test",
    provider_did="did:prism:provider"
)
print(f"Transaction ID: {tx_id}")
```

## Common Issues

### Backend Issues

**Issue**: `ImportError: No module named 'pycardano'`
**Solution**: `pip install -r requirements.txt`

**Issue**: `django.db.utils.OperationalError: could not connect to server`
**Solution**: Ensure PostgreSQL is running or use SQLite for testing

**Issue**: `KeyError: 'DB_ENCRYPTION_KEY'`
**Solution**: Set environment variable: `$env:DB_ENCRYPTION_KEY="test_key"`

### Frontend Issues

**Issue**: `Cannot find module '@meshsdk/react'`
**Solution**: `npm install`

**Issue**: Wallet not connecting
**Solution**: 
- Ensure wallet extension is installed
- Ensure you're on testnet in wallet settings
- Refresh page and try again

**Issue**: API calls failing with CORS error
**Solution**: Check backend CORS settings in settings.py

## Performance Testing

### Backend Load Testing

```bash
# Install locust
pip install locust

# Create locustfile.py with API tests
# Run load test
locust -f locustfile.py --host=http://localhost:8000
```

### Frontend Performance

```bash
# Build production bundle
npm run build

# Analyze bundle size
npm run build -- --analyze

# Run Lighthouse audit
# Open Chrome DevTools > Lighthouse > Run audit
```

## Security Testing

### Backend Security Checks

```bash
# Check for security vulnerabilities
pip install safety
safety check

# Run Django security checks
python manage.py check --deploy
```

### Frontend Security Checks

```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix
```

## Next Steps

1. Add more comprehensive unit tests
2. Add integration tests for API endpoints
3. Add E2E tests with Playwright
4. Set up CI/CD pipeline
5. Add performance benchmarks
6. Security audit before production
