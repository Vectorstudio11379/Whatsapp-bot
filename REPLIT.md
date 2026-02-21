# Deploy WhatsApp Bot on Replit

Follow these steps to run your bot 24/7 on Replit.

## 1. Create a Replit Project

1. Go to [replit.com](https://replit.com) and sign in
2. Click **Create Repl** → **Import from GitHub** (or upload your project folder)
3. Select your WhatsApp bot project

## 2. Set Up MongoDB (Required for Replit)

Replit's filesystem is ephemeral, so the bot needs MongoDB to save the WhatsApp session.

**Option A: MongoDB Atlas (Free)**

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user (remember the password)
4. Get your connection string: **Database** → **Connect** → **Connect your application**
5. Copy the URI (looks like `mongodb+srv://user:password@cluster.xxxxx.mongodb.net/`)

**Option B: Replit MongoDB (if available)**

Use Replit's MongoDB add-on from the Tools/Secrets panel.

## 3. Add Secrets on Replit

1. In your Repl, click **Tools** (or the lock icon) → **Secrets**
2. Add a secret:
   - **Key:** `MONGODB_URI`
   - **Value:** Your MongoDB connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/whatsapp`)

## 4. Install Dependencies

Replit usually runs `npm install` automatically. If not, run in the Shell:

```bash
npm install
```

## 5. Run the Bot

1. Click **Run** (or type `npm start`)
2. On first run, a **QR code** will appear in the console
3. Open WhatsApp on your phone → **Settings** → **Linked Devices** → **Link a Device**
4. Scan the QR code
5. The session is saved to MongoDB—you won't need to scan again on restart

## 6. Keep Running 24/7

- **Free Repls** may sleep after inactivity. Upgrade to **Replit Hacker** for always-on.
- Or use **Replit Deployments** to deploy to a persistent server (see Replit docs).

## Files Checklist

Ensure these files are in your project:

- `index.js` - Main bot
- `config.js` - Your configuration
- `spam-detector.js` - Spam detection
- `WhatsApp Image 2026-02-20 at 10.37.41.jpeg` - Recruitment poster
- `WhatsApp Image 2026-02-21 at 11.15.06.jpeg` - Prayer group poster

## Troubleshooting

**"Cannot find module"** – Run `npm install`

**QR code not showing** – Check the Replit console/Shell tab

**Bot disconnects** – Ensure `MONGODB_URI` is set so the session persists

**Puppeteer/Chromium errors** – Replit includes Chromium. If issues persist, check Replit's Node.js version (needs 18+).
