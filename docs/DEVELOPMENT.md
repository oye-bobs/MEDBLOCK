# MEDBLOCK Development Guide

## Getting Started

This guide will help you set up and run the MEDBLOCK development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- **Docker Compose** v2.0+
- **Node.js** 18+ (for both backend and frontend)
- **Git** for version control

### Optional but Recommended
- **Cardano Wallet** (Nami, Eternl, or Flint browser extension)
- **Visual Studio Code** with extensions:
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
# Backend Setup
cd backend-js
cp .env.example .env

# Edit .env with your configuration
# At minimum, set these values:
# - DATABASE_PASSWORD (choose a secure password)
# - JWT_SECRET (generate a strong secret)
# - ENCRYPTION_KEY (32-byte hex string)
# - BLOCKFROST_PROJECT_ID (for Cardano integration)
```

### 3. Start Infrastructure with Docker

```bash
# Start all services (Cardano node, PostgreSQL, Redis)
cd ..
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

## Development Workflow

### Backend Development (NestJS)

#### Running Locally

```bash
cd backend-js

# Install dependencies
npm install

# Start development server (watch mode)
npm run start:dev

# Start in debug mode
npm run start:debug
```

#### Running Tests

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

#### Code Quality

```bash
# Format code with Prettier
npm run format

# Lint with ESLint
npm run lint
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
```

### Smart Contract Development

#### Plutus Contracts (Consent Management)

```bash
cd contracts/consent

# Build contract
cabal build

# Run tests
cabal test
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
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs
- **PostgreSQL**: localhost:5432

### Database Management

The backend uses TypeORM with `synchronize: true` in development, so schema changes are applied automatically when the server starts.

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
# Restart backend to re-sync schema
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

## Troubleshooting

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
```

### Build Fails

**Problem**: `npm run build` fails

**Solution**:
```bash
# Check for type errors
npm run build
# Fix reported TypeScript errors
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Disable `synchronize: true` in TypeORM config
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure monitoring
- [ ] Switch to Cardano mainnet

### Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d
```

## Additional Resources

- [MEDBLOCK Architecture](docs/ARCHITECTURE.md)
- [API Documentation](http://localhost:8000/api/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Lucid Documentation](https://lucid.spacebudz.io/)
- [Cardano Developer Portal](https://developers.cardano.org/)

## Getting Help

- **Issues**: Report bugs on GitHub Issues
- **Documentation**: Check `/docs` directory

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
