# Deploy WhatsApp Bot on Fly.io

Fly.io is often **faster** than Railway. Uses the same Dockerfile. Requires the Fly CLI.

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

## Part 2: Install Fly CLI

**Windows (PowerShell):**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

Or download from [fly.io/docs/hands-on/install-flyctl](https://fly.io/docs/hands-on/install-flyctl/)

---

## Part 3: Sign Up & Login

1. Go to [fly.io](https://fly.io) → **Sign up** (free, credit card required but not charged for free tier)
2. In terminal: `fly auth login`

---

## Part 4: Deploy

1. Open terminal in the project folder
2. Run:
   ```bash
   fly launch --no-deploy
   ```
   - When asked for app name: use a **unique** name (e.g. `mirola-whatsapp-bot`) – Fly app names must be globally unique
   - When asked for region: pick one close to you (e.g. `jnb` for Johannesburg, `lhr` for London)

3. Set secrets (replace with your values):
   ```bash
   fly secrets set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/whatsapp"
   fly secrets set PHONE_NUMBER="2348012345678"
   ```
   - `PHONE_NUMBER` = your WhatsApp number, no + or spaces (for pairing code; helps when QR fails)
   - To use QR instead, omit `PHONE_NUMBER`

4. Deploy:
   ```bash
   fly deploy
   ```

---

## Part 5: Get the QR Code or Pairing Code

1. View logs:
   ```bash
   fly logs
   ```

2. Wait 1–2 minutes for the bot to start

3. **If using QR:** Look for `📱 Scan this QR code` and the URL. Open the URL in your browser to see the QR, then scan with WhatsApp.

4. **If using pairing code (PHONE_NUMBER set):** Look for `📱 PAIRING CODE` and the 8-character code. On your phone: WhatsApp → Linked Devices → Link a Device → **Link with phone number** → enter the code.

---

## Part 6: Useful Commands

| Command | Description |
|---------|-------------|
| `fly logs` | View live logs |
| `fly status` | Check app status |
| `fly scale memory 1024` | Increase RAM if you see memory errors |
| `fly secrets set CLEAR_SESSION=true` | Clear session (rescan QR/code) – remove after linking |
| `fly deploy` | Redeploy after code changes |

---

## Troubleshooting

**"Couldn't link device"** – Set `CLEAR_SESSION=true` and `PHONE_NUMBER`:
```bash
fly secrets set CLEAR_SESSION=true PHONE_NUMBER="2348012345678"
fly deploy
```
After linking, remove CLEAR_SESSION: `fly secrets unset CLEAR_SESSION`

**Out of memory / Chromium crash** – Increase RAM:
```bash
fly scale memory 1024
```

**Change region** – Edit `primary_region` in `fly.toml` (e.g. `lhr`, `ewr`, `jnb`), then `fly deploy`

---

## Optional: Auto-deploy from GitHub

After your app is created (Part 4 above), enable auto-deploy on push:

1. Create deploy token: `fly tokens create deploy -x 999999h` (copy the output)
2. In your GitHub repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name: `FLY_API_TOKEN`
   - Value: paste the token
3. The repo includes `.github/workflows/fly.yml` – push to `main` and it deploys automatically
