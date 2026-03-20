# Quick Setup Guide

Follow these steps to get your Personal Finance App up and running in under 10 minutes!

## Step 1: Firebase Setup (5 minutes)

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `personal-finance-app` (or any name you like)
4. Disable Google Analytics (optional for this app)
5. Click **"Create project"**

### Add Web App

1. On the project overview page, click the **web icon** (</>)
2. App nickname: `Personal Finance Web App`
3. **Don't** check "Firebase Hosting" yet
4. Click **"Register app"**
5. **Copy the firebaseConfig object** - you'll need this!

### Enable Firestore Database

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (important!)
4. Select your closest region (e.g., us-central1)
5. Click **"Enable"**

## Step 2: Configure Your App (2 minutes)

### Create Environment File

1. In your terminal, navigate to the project folder:
\`\`\`bash
cd personal-finance-app
\`\`\`

2. Copy the example env file:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Open `.env` in your code editor

4. Paste your Firebase credentials:
\`\`\`env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
\`\`\`

5. Save the file

## Step 3: Run the App (1 minute)

1. Install dependencies (if you haven't already):
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open your browser to: [http://localhost:5173](http://localhost:5173)

## Step 4: Initial Setup in the App (2 minutes)

1. Click the **Settings** icon (bottom right)
2. Enter your current financial data:
   - Bank Balance: $5,000 (example)
   - Stocks Value: $10,000 (example)
   - Crypto Value: $2,000 (example)
   - Credit Card Due: $500 (example)
   - Monthly Salary: $5,000 (example)
3. Click **"Save Changes"**

## You're Done! 🎉

Now you can:
- Add expenses using the **+** button
- Try voice input by clicking the microphone
- Set goals in the **Goals** tab
- Track investments in the **Invest** tab

---

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Check your `.env` file exists and has all the correct values
- Restart the dev server after creating/editing `.env`

### "Missing or insufficient permissions"
- Make sure you selected **"Test mode"** when creating Firestore
- Check Firestore Rules in Firebase Console

### Voice input not working
- Use Chrome or Edge browser (Safari has limited support)
- Grant microphone permissions when prompted

### App shows blank screen
- Check browser console for errors (F12)
- Verify all npm packages installed successfully
- Try clearing cache and hard refresh (Cmd/Ctrl + Shift + R)

---

## Next Steps

### Deploy to the Web (Optional)

Once you're happy with the app, deploy it to Firebase Hosting:

\`\`\`bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Build and deploy
npm run build
firebase deploy
\`\`\`

Your app will be live at: `https://your-project-id.web.app`

### Make it Your Own

- Customize categories in `src/components/ExpenseForm/ExpenseForm.jsx`
- Adjust colors in `tailwind.config.js`
- Add new features from the Future Enhancements list in README

---

**Need help?** Check the main [README.md](./README.md) for detailed documentation.
