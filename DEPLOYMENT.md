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

## 3. Oracle Cloud (Always free VPS) ⭐ Recommended for free 24/7

**Best for:** Truly free, always-on, full control

You get a **free VM** that runs 24/7. More setup, but no recurring cost.

**📖 Full step-by-step guide:** [ORACLE_CLOUD.md](ORACLE_CLOUD.md)

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
