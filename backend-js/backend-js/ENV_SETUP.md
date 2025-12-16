# Environment Variables for MEDBLOCK Backend

## Required Variables

### Database Configuration
```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

### JWT Secret
```
JWT_SECRET=your-secret-key-here
```

### Cardano Blockchain (Optional - for real DID minting)
```
CARDANO_NETWORK=preprod
BLOCKFROST_PROJECT_ID=your-blockfrost-project-id
BLOCKFROST_URL=https://cardano-preprod.blockfrost.io/api/v0
CARDANO_WALLET_SEED=your-wallet-seed-phrase
```

### Email Configuration (Required for OTP Verification)
```
# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=MEDBLOCK <noreply@medblock.com>
```

## Email Setup Instructions

### For Gmail:
1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password
3. Use the app password as `SMTP_PASS`

### For Other Email Providers:
- **Outlook/Hotmail**: 
  - SMTP_HOST=smtp-mail.outlook.com
  - SMTP_PORT=587
  
- **Yahoo**:
  - SMTP_HOST=smtp.mail.yahoo.com
  - SMTP_PORT=587

- **SendGrid** (Recommended for production):
  - SMTP_HOST=smtp.sendgrid.net
  - SMTP_PORT=587
  - SMTP_USER=apikey
  - SMTP_PASS=your-sendgrid-api-key

## Development Mode

If email is not configured, the OTP will be logged to the console for testing purposes.

## Example .env File

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/medblock?sslmode=require

# JWT
JWT_SECRET=super-secret-key-change-in-production

# Email (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=medblock@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=MEDBLOCK <noreply@medblock.com>

# Cardano (Optional)
CARDANO_NETWORK=preprod
BLOCKFROST_PROJECT_ID=
BLOCKFROST_URL=
CARDANO_WALLET_SEED=
```
