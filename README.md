# Personal Finance Management App

A beautiful, mobile-first web application to track your personal finances, set goals, and manage your wealth journey.

## Features

### 🎯 Core Features
- **Net Worth Tracking**: Track bank balance, stocks, crypto, and credit card debt
- **Daily Expense Logging**: Quick, frictionless expense entry with voice input
- **Goal Setting**: Set short-term and long-term financial goals with progress tracking
- **Investment Portfolio**: Monitor your stocks and crypto investments
- **Smart Recommendations**: Get insights on spending needed to reach your goals
- **Mobile-First Design**: Optimized for daily use on your phone

### 💎 Key Highlights
- **Voice Input**: Say "Coffee 5 dollars" to log expenses hands-free
- **Quick Entry**: Add expenses in 5-10 seconds with floating + button
- **Real-time Updates**: All balances update automatically based on your logs
- **Beautiful UI**: Clean, elegant design with dark mode support
- **Cloud Sync**: Data syncs across all your devices via Firebase

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore + Hosting)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### 1. Clone and Install

\`\`\`bash
cd personal-finance-app
npm install
\`\`\`

### 2. Firebase Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, click on the web icon (</>) to add a web app
4. Register your app (you can name it "Personal Finance")
5. Copy the Firebase configuration

#### Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in **test mode**" (for development)
4. Select your preferred region
5. Click "Enable"

#### Setup Firestore Security Rules (Optional but recommended)

Go to Firestore Database > Rules and update:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents (single user app)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
\`\`\`

**Note**: Since this is a single-user app, these rules are permissive. For production, you should add authentication and restrict access.

### 3. Configure Environment Variables

1. Copy the example env file:
\`\`\`bash
cp .env.example .env
\`\`\`

2. Open \`.env\` and paste your Firebase configuration:
\`\`\`env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
\`\`\`

### 4. Update Firebase Config

Open \`src/services/firebase.js\` and update it to use environment variables:

\`\`\`javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
\`\`\`

### 5. Run the App

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage Guide

### Initial Setup

1. **Go to Settings**: Click the Settings icon in the bottom navigation
2. **Set Your Initial Balances**:
   - Bank Balance: Your current bank account balance
   - Stocks Value: Total value of your stock investments
   - Crypto Value: Total value of your crypto holdings
   - Credit Card Due: Current credit card balance owed
   - Monthly Salary: Your monthly income
3. **Save Changes**

### Adding Expenses

#### Method 1: Manual Entry
1. Click the **+** button on the home screen
2. Enter the amount
3. Select category (Groceries, Dining, etc.)
4. Choose payment method (Bank or Credit Card)
5. Add optional note
6. Click "Add Expense"

#### Method 2: Voice Input
1. Click the **+** button
2. Click the **microphone icon**
3. Say: "Coffee 5 dollars" or "Groceries 50"
4. Review and submit

### Setting Goals

1. Go to the **Goals** tab
2. Click the **+** button
3. Fill in:
   - Goal name (e.g., "Emergency Fund")
   - Target amount
   - Target date
   - Goal type (short-term or long-term)
   - Track against net worth (checkbox)
4. Click "Add Goal"

The app will show you how much you need to save monthly to reach your goal!

### Tracking Investments

1. When you buy stocks/crypto, log it as an expense:
   - Category: **Investments**
   - Sub-category: **Stocks** or **Crypto**
   - Amount: How much you invested
2. Your investment value will automatically increase
3. To update current market values, go to Settings and adjust

### How It Works

- **Bank payments** deduct from your bank balance
- **Credit card payments** increase your credit card due
- **Investment purchases** deduct from bank and add to investment value
- **Paying credit card** reduces both bank balance and credit card due
- **Net worth** is calculated as: Bank + Stocks + Crypto - Credit Due

## Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI:
\`\`\`bash
npm install -g firebase-tools
\`\`\`

2. Login to Firebase:
\`\`\`bash
firebase login
\`\`\`

3. Initialize Firebase Hosting:
\`\`\`bash
firebase init hosting
\`\`\`

Select:
- Use existing project (choose your Firebase project)
- Public directory: \`dist\`
- Configure as SPA: Yes
- Set up automatic builds: No

4. Build your app:
\`\`\`bash
npm run build
\`\`\`

5. Deploy:
\`\`\`bash
firebase deploy
\`\`\`

Your app will be live at: \`https://your-project-id.web.app\`

## Tips for Long-Term Use

1. **Daily Habit**: Log expenses as they happen, not at end of day
2. **Voice Input**: Use voice when on-the-go for speed
3. **Regular Updates**: Update investment values monthly
4. **Backup**: Periodically export your data from Firebase Console
5. **Goals**: Review and adjust goals quarterly
6. **Salary Changes**: Update monthly salary in Settings when you get raises

## Browser Compatibility

- Voice input works best in Chrome/Edge
- Safari has limited Web Speech API support
- All other features work on all modern browsers

## Future Enhancements

Some ideas for future development:
- [ ] Recurring expenses automation
- [ ] Spending analytics and charts
- [ ] Budget alerts
- [ ] Multiple user accounts
- [ ] Data export to CSV
- [ ] Receipt scanning with OCR
- [ ] Bank integration APIs
- [ ] Monthly spending reports
- [ ] Category-wise spending limits

## Troubleshooting

### Firebase Connection Issues
- Check your \`.env\` file has correct Firebase credentials
- Ensure Firestore is enabled in Firebase Console
- Verify Firestore rules allow read/write access

### Voice Input Not Working
- Ensure you're using Chrome or Edge browser
- Grant microphone permissions when prompted
- Check browser console for errors

### App Not Loading
- Clear browser cache and hard refresh (Cmd/Ctrl + Shift + R)
- Check browser console for errors
- Verify all dependencies are installed (\`npm install\`)

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## License

MIT License - feel free to use and modify as needed.

---

Built with ❤️ for better financial awareness
