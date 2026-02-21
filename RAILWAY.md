# Deploy WhatsApp Bot on Railway

Railway is the easiest way to deploy. You get **$5 free credit** (no card required for trial). Puppeteer works on Railway.

---

## Part 1: Create MongoDB (Required)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Sign up (free)
2. **Create** a free M0 cluster
3. **Database Access** → Add Database User → Create username & password (save them!)
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
5. **Database** → Connect → **Connect your application** → Copy the connection string
6. Replace `<password>` in the URI with your actual password

Example: `mongodb+srv://user:MyPass123@cluster0.xxxxx.mongodb.net/whatsapp`

---

## Part 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) → **Login** (use GitHub)
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Choose **Vectorstudio11379/Whatsapp-bot** (authorize if prompted)
5. Railway will detect your repo and start deploying

---

## Part 3: Add Environment Variables

1. Click your **service** (the deployed app)
2. Go to **Variables** tab
3. Click **+ New Variable**
4. Add:
   - **Key:** `MONGODB_URI`
   - **Value:** Your MongoDB connection string (paste the full URI)

5. Railway will **redeploy automatically** when you save

---

## Part 4: Get the QR Code

1. Go to **Deployments** tab
2. Click the latest deployment
3. Click **View Logs**
4. Wait for the bot to start (1–2 minutes)
5. You'll see: **📱 Scan this QR code with WhatsApp**
6. Scan the QR code with your phone:
   - WhatsApp → Settings → Linked Devices → Link a Device
   - Scan the QR from the logs

---

## Part 5: Keep It Running

- **Free trial:** $5 credit (~500 hours)
- **After trial:** Add payment method for ~$5/month, or use the $1/month free tier (limited)
- The bot stays running 24/7 while you have credit

---

## Troubleshooting

**"libglib-2.0.so.0: cannot open shared object file"** – The project includes a `Dockerfile` that installs Chromium dependencies. Railway should use it automatically. If not, ensure Railway is building from the Dockerfile (Settings → Build → Builder: Dockerfile).

**"Build failed"** – Check the build logs. Ensure `package.json` has correct `start` script.

**"No QR code"** – Wait 2–3 min for Puppeteer to start. Check logs for errors.

**"MongoDB connection failed"** – Verify `MONGODB_URI` is set correctly. No spaces in the value. Password in URI must be URL-encoded if it has special chars.

**"Application failed to respond"** – Normal for WhatsApp bots (no HTTP server). Railway may show this but the bot still runs. Check logs.

**Session lost after redeploy** – Session is saved in MongoDB. You should NOT need to scan again unless you clear the DB.
