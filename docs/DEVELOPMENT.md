# MEDBLOCK Development Guide

## Getting Started

This guide will help you set up and run the MEDBLOCK development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- **Docker Compose** v2.0+
- **Node.js** 18+ (for frontend development)
- **Python** 3.11+ (for backend development)
- **Git** for version control

### Optional but Recommended
- **Cardano Wallet** (Nami, Eternl, or Flint browser extension)
- **Visual Studio Code** with extensions:
  - Python
  - ESLint
  - Prettier
  - Docker

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MEDBLOCK
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# At minimum, set these values:
# - DJANGO_SECRET_KEY (generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
# - DB_PASSWORD (choose a secure password)
# - DB_ENCRYPTION_KEY (generate with: python -c "import secrets; print(secrets.token_hex(32))")
```

### 3. Start Infrastructure with Docker

```bash
# Start all services (Cardano node, PostgreSQL, Redis, Backend, Frontends)
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

**Note**: The Cardano node will take several hours to sync on first run. You can monitor progress:

```bash
docker-compose logs -f cardano-node
```

### 4. Initialize Database

```bash
# Run Django migrations
docker-compose exec backend python manage.py migrate

# Create superuser for admin panel
docker-compose exec backend python manage.py createsuperuser
```

## Development Workflow

### Backend Development

#### Running Locally (without Docker)

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

# Set environment variables
# Windows:
$env:DJANGO_DEBUG="True"
$env:DB_HOST="localhost"
# Mac/Linux:
export DJANGO_DEBUG=True
export DB_HOST=localhost

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

#### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest backend/tests/test_blockchain_integration.py
```

#### Code Quality

```bash
# Format code with Black
black .

# Lint with Flake8
flake8 .

# Type checking with MyPy
mypy .
```

### Frontend Development

#### Patient Portal

```bash
cd frontend/patient-portal

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

#### Provider Portal

```bash
cd frontend/provider-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

### Smart Contract Development

#### Plutus Contracts (Consent Management)

```bash
cd contracts/consent

# Build contract
cabal build

# Run tests
cabal test

# Generate Plutus script
cabal run generate-script
```

#### Marlowe Contracts (Insurance Claims)

```bash
cd contracts/claims

# Validate contract
marlowe-cli run analyze --contract insurance_claim.marlowe

# Simulate execution
marlowe-cli run simulate --contract insurance_claim.marlowe
```

## Common Tasks

### Accessing Services

- **Patient Portal**: http://localhost:3000
- **Provider Portal**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Django Admin**: http://localhost:8000/admin
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Database Management

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U medblock_user -d medblock_db

# Create database backup
docker-compose exec postgres pg_dump -U medblock_user medblock_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U medblock_user medblock_db < backup.sql

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend python manage.py migrate
```

### Cardano Node Operations

```bash
# Check node sync status
docker-compose exec cardano-node cardano-cli query tip --testnet-magic 1

# View node logs
docker-compose logs -f cardano-node

# Restart node
docker-compose restart cardano-node
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

## Troubleshooting

### Cardano Node Won't Sync

**Problem**: Node stuck at 0% sync

**Solution**:
```bash
# Stop services
docker-compose down

# Remove node data (will re-sync from scratch)
docker volume rm medblock_cardano-node-data

# Restart
docker-compose up -d cardano-node
```

### Database Connection Errors

**Problem**: Backend can't connect to PostgreSQL

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Verify credentials in .env match docker-compose.yml
```

### Port Already in Use

**Problem**: `Error: port 8000 already in use`

**Solution**:
```bash
# Find process using port (Windows)
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
ports:
  - "8001:8000"  # Use 8001 instead
```

### Frontend Build Fails

**Problem**: `npm run build` fails with memory error

**Solution**:
```bash
# Increase Node memory limit
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

## Testing

### Unit Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend/patient-portal
npm test
```

### Integration Tests

```bash
# Test Cardano integration
pytest backend/tests/test_blockchain_integration.py -v

# Test FHIR resources
pytest backend/tests/test_fhir_models.py -v
```

### End-to-End Tests

```bash
# Patient portal E2E
cd frontend/patient-portal
npm run test:e2e

# Provider portal E2E
cd frontend/provider-portal
npm run test:e2e
```

## Deployment

### Production Checklist

- [ ] Set `DJANGO_DEBUG=False` in `.env`
- [ ] Generate new `DJANGO_SECRET_KEY`
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Audit smart contracts
- [ ] Switch to Cardano mainnet (update `.env`)

### Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d
```

## Additional Resources

- [MEDBLOCK Architecture](docs/ARCHITECTURE.md)
- [API Documentation](http://localhost:8000/docs)
- [Cardano Developer Portal](https://developers.cardano.org/)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [PyCardano Documentation](https://pycardano.readthedocs.io/)

## Getting Help

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join our Discord/Slack channel
- **Documentation**: Check `/docs` directory

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
