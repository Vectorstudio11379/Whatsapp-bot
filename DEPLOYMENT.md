# Free Hosting Alternatives (Replit Not Working?)

If Replit keeps failing, try these platforms. All need **MongoDB** for session storage (use free [MongoDB Atlas](https://www.mongodb.com/atlas)).

---

## 1. Railway (Easiest – $5 free credit)

**Best for:** Quick deploy, Puppeteer support

1. Go to [railway.app](https://railway.app) → Sign up
2. **New Project** → **Deploy from GitHub** → Select `Vectorstudio11379/Whatsapp-bot`
3. Add **Variables** (Settings → Variables):
   - `MONGODB_URI` = your MongoDB connection string
4. Click **Deploy**
5. Check **Logs** for the QR code → scan with WhatsApp

**Note:** Railway gives ~$5 free credit. After that, ~$5/month. Puppeteer works on Railway.

---

## 2. Render (Free tier – may sleep)

**Best for:** Free, but service sleeps after 15 min of no traffic

1. Go to [render.com](https://render.com) → Sign up
2. **New** → **Web Service**
3. Connect your GitHub repo: `Vectorstudio11379/Whatsapp-bot`
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. **Environment** → Add `MONGODB_URI`
6. Deploy → Check logs for QR code

**Limitation:** Free tier sleeps after inactivity. Your WhatsApp session may disconnect. Consider upgrading to paid ($7/mo) for always-on.

---

## 3. Oracle Cloud (Always free VPS)

**Best for:** Truly free, always-on, full control

You get a **free VM** that runs 24/7. More setup, but no recurring cost.

### Steps

1. **Create account:** [oracle.com/cloud/free](https://www.oracle.com/cloud/free)
2. **Create a VM:**
   - Compute → Instances → Create Instance
   - Choose **Always Free** shape (Ampere or VM.Standard.E2.1.Micro)
   - Download SSH key
3. **Connect via SSH** and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Chromium dependencies (for Puppeteer)
sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libcups2 libxss1 libxtst6

# Clone your repo
git clone https://github.com/Vectorstudio11379/Whatsapp-bot.git
cd Whatsapp-bot

# Install and run
npm install
export MONGODB_URI="your-mongodb-uri-here"
npm start
```

4. Scan QR code. To keep running after you disconnect, use `tmux` or `screen`:

```bash
sudo apt install -y tmux
tmux new -s bot
npm start
# Press Ctrl+B then D to detach. Bot keeps running.
```

---

## 4. Fly.io (Free tier with limits)

1. Install [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)
2. In your project folder:

```bash
fly launch
fly secrets set MONGODB_URI=your-mongodb-uri
fly deploy
```

Check logs: `fly logs` for QR code.

---

## Summary

| Platform    | Cost        | Always-on? | Ease of setup |
|------------|-------------|------------|---------------|
| Railway    | ~$5 credit  | Yes        | Easy          |
| Render     | Free        | No (sleeps)| Easy          |
| Oracle Cloud | Free      | Yes        | Medium        |
| Fly.io     | Free tier   | Yes*       | Medium        |

**Recommendation:** Try **Railway** first (simplest). If you need fully free and always-on, use **Oracle Cloud**.
