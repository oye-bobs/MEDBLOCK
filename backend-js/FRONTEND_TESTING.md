# MEDBLOCK Patient Portal - Manual Testing Guide

## ✅ Server Status
**Dev server is running at: http://localhost:3000**

## 🎯 Testing Steps

### 1. Open the Patient Portal
1. Open your browser (Chrome/Edge recommended)
2. Navigate to: **http://localhost:3000**
3. You should see the MEDBLOCK registration page

### 2. Test Registration Flow

#### Step 1: Connect Nami Wallet
- Click the **"Connect Wallet"** button
- Your Nami wallet extension should pop up
- **Important**: Make sure Nami is set to **Preprod Testnet** (not Mainnet)
  - Open Nami → Settings → Network → Select "Preprod"
- Click "Approve" in Nami to connect

#### Step 2: Fill Registration Form
Once wallet is connected, you'll see a form:
- **First Name**: Enter your first name
- **Last Name**: Enter your last name
- **Gender**: Select from dropdown
- **Date of Birth**: Optional
- **Email**: Enter your email
- **Phone**: Enter your phone number
- Click **"Create Account"**

#### Step 3: Sign Authentication Message
- Nami will pop up asking you to sign a message
- This creates your DID (Decentralized Identifier)
- Click "Sign" in Nami
- Wait for DID creation (should take a few seconds)

#### Step 4: Explore Dashboard
Once registered, you'll be redirected to the dashboard:
- **Stats Cards**: Shows medical records count, active consents
- **Recent Records**: List of your medical records (empty initially)
- **Blockchain Info**: Security information banner

### 3. Test Navigation

Click through the navigation menu:
- **Dashboard**: Overview and stats
- **Medical Records**: View all your records
- **Consent Management**: Grant/revoke provider access
- **Access Log**: Audit trail of record access
- **Profile**: Your DID and personal information

### 4. Test Consent Management

1. Go to **Consent Management** page
2. Click **"Grant Consent"** button
3. Enter a provider DID (you can use a test DID like `did:prism:test123`)
4. Select duration (24h, 72h, 1 week, 30 days)
5. Click **"Grant Access"**
6. The consent should appear in the active consents list
7. Try clicking **"Revoke"** to revoke the consent

### 5. Test Profile Page

1. Go to **Profile** page
2. You should see:
   - Your name and demographics
   - Your DID (starts with `did:prism:`)
   - Your Patient ID (UUID)
   - Contact information
   - Security warning about private key

## 🔍 What to Look For

### ✅ Expected Behavior
- Clean, modern UI with blue/white color scheme
- Responsive design (try resizing browser)
- Smooth navigation between pages
- Wallet balance displayed in header (if you have test ADA)
- DID displayed in header
- Icons from Lucide React
- Tailwind CSS styling

### ⚠️ Known Limitations (Without Backend)
Since the backend API is not running, you'll see:
- **API errors in browser console** (this is expected)
- **Empty data** on dashboard and records pages
- **Consent grant will fail** (no backend to process it)
- **Profile page won't load** (no API to fetch data)

The UI and wallet integration will work, but data operations require the backend.

## 🐛 Troubleshooting

### Wallet Not Connecting
- Ensure Nami extension is installed and unlocked
- Check that you're on Preprod testnet in Nami settings
- Refresh the page and try again

### Page Not Loading
- Check that dev server is running (should see output in terminal)
- Verify you're accessing http://localhost:3000
- Check browser console for errors (F12)

### CSS Not Loading
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### API Errors in Console
- This is expected! The backend is not running
- You're only testing the frontend UI and wallet integration

## 📸 What You Should See

### Registration Page
- MEDBLOCK logo and title
- "Connect Your Wallet" button
- Clean gradient background (blue tones)
- Supported wallets listed

### Dashboard (After Login)
- Header with navigation
- Wallet balance (if connected)
- Your DID in header
- Stats cards with icons
- Recent records section (empty without backend)
- Blockchain security banner

### Consent Page
- "Grant Consent" button
- Active consents list (empty initially)
- Blue info banner about blockchain-powered consent

## ✅ Testing Checklist

- [ ] Page loads at http://localhost:3000
- [ ] Registration page displays correctly
- [ ] "Connect Wallet" button is visible
- [ ] Nami wallet connects successfully
- [ ] Registration form appears after wallet connection
- [ ] Form fields are functional
- [ ] Navigation menu works
- [ ] Dashboard page loads
- [ ] Medical Records page loads
- [ ] Consent Management page loads
- [ ] Access Log page loads
- [ ] Profile page loads
- [ ] Responsive design works (resize browser)
- [ ] Logout button works
- [ ] Mobile menu works (on small screens)

## 🎉 Success Criteria

If you can:
1. ✅ Connect your Nami wallet
2. ✅ See the registration form
3. ✅ Navigate between pages
4. ✅ See your DID in the header
5. ✅ UI looks clean and professional

Then the frontend is working correctly! 🚀

## 🔜 Next Steps

To test the full system:
1. Install Docker Desktop
2. Start backend: `docker-compose up -d`
3. Wait for Cardano node to sync
4. Then test the complete registration and data flow
