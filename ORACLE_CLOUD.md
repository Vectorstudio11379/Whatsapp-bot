# Deploy WhatsApp Bot on Oracle Cloud (Always Free)

Oracle Cloud gives you a **free VM** that runs 24/7. No credit card charges after signup.

---

## Part 1: Create Oracle Cloud Account

1. Go to [oracle.com/cloud/free](https://www.oracle.com/cloud/free)
2. Click **Start for free**
3. Sign up (email, country, etc.)
4. Add payment method for verification (you won't be charged if you stay in free tier)
5. Choose your **Home Region** (e.g. Phoenix, Frankfurt)
6. Complete signup

---

## Part 2: Create a Free VM

1. Log in to [Oracle Cloud Console](https://cloud.oracle.com)
2. Click **☰ Menu** (top left) → **Compute** → **Instances**
3. Click **Create instance**

### Instance settings:

| Setting | Value |
|---------|-------|
| **Name** | whatsapp-bot |
| **Placement** | Keep default |
| **Image and shape** | Click **Edit** |
| **Image** | Oracle Linux 8 or Ubuntu 22.04 |
| **Shape** | Change shape → **Ampere** → Select **VM.Standard.A1.Flex** (Always Free) |
| | OR use **AMD** → **VM.Standard.E2.1.Micro** (Always Free) |
| **Networking** | Create new VCN if needed, allow SSH (port 22) |
| **Add SSH keys** | Generate a key pair → **Save Private Key** and **Save Public Key** |

4. Click **Create**
5. Wait 2–3 minutes for the instance to start
6. Note the **Public IP address** (e.g. 129.146.xxx.xxx)

---

## Part 3: Open Firewall (Ingress Rules)

1. Go to **Networking** → **Virtual Cloud Networks** → your VCN
2. Click **Security Lists** → **Default Security List**
3. **Add Ingress Rules** → Add:
   - **Source:** 0.0.0.0/0
   - **Destination Port:** 22 (SSH)
   - **Description:** SSH

---

## Part 4: Connect via SSH

### Windows (PowerShell or Git Bash):

```powershell
# Use the private key you downloaded (e.g. ssh-key-2024-xx-xx.key)
ssh -i "C:\path\to\your-private-key.key" opc@YOUR_PUBLIC_IP
```

For **Ubuntu** image, use `ubuntu@YOUR_PUBLIC_IP` instead of `opc`.

### If you get "Permission denied":
- Right-click the `.key` file → Properties → Security → ensure only you have access
- Or use: `ssh -i key.key -o PubkeyAuthentication=yes opc@IP`

---

## Part 5: Install & Run the Bot

Once connected via SSH, run these commands **one by one**:

```bash
# 1. Update system
sudo dnf update -y
# (If Ubuntu: sudo apt update && sudo apt upgrade -y)

# 2. Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
# (If Ubuntu: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs)

# 3. Install Chromium dependencies (required for Puppeteer)
sudo dnf install -y atk at-spi2-atk cups-libs gtk3 libXcomposite libXdamage libXrandr libgbm pango
# (If Ubuntu: sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libcups2 libxss1 libxtst6 fonts-liberation)

# 4. Install Git
sudo dnf install -y git
# (If Ubuntu: sudo apt install -y git)

# 5. Clone your bot
git clone https://github.com/Vectorstudio11379/Whatsapp-bot.git
cd Whatsapp-bot

# 6. Install dependencies
npm install

# 7. Create .env file with your MongoDB URI
echo 'MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/whatsapp' > .env
# Edit with: nano .env (replace with your real MongoDB Atlas URI)

# 8. Run the bot
npm start
```

**Scan the QR code** with WhatsApp when it appears.

---

## Part 6: Keep Bot Running 24/7 (tmux)

When you close SSH, the bot stops. Use **tmux** to keep it running:

```bash
# Install tmux
sudo dnf install -y tmux
# (Ubuntu: sudo apt install -y tmux)

# Start a session and run the bot
tmux new -s whatsapp
cd ~/Whatsapp-bot
npm start
```

**To detach** (leave bot running): Press `Ctrl+B` then `D`

**To reattach later:**
```bash
ssh -i your-key.key opc@YOUR_IP
tmux attach -t whatsapp
```

**To stop the bot:** Reattach, then press `Ctrl+C`

---

## Part 7: Optional – Run as a Service (survives reboot)

Create a systemd service so the bot starts automatically:

```bash
sudo nano /etc/systemd/system/whatsapp-bot.service
```

Paste (replace `YOUR_USER` with your username, e.g. `opc`):

```ini
[Unit]
Description=WhatsApp Bot
After=network.target

[Service]
Type=simple
User=YOUR_USER
WorkingDirectory=/home/YOUR_USER/Whatsapp-bot
Environment=NODE_ENV=production
EnvironmentFile=/home/YOUR_USER/Whatsapp-bot/.env
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-bot
sudo systemctl start whatsapp-bot
sudo systemctl status whatsapp-bot
```

**View logs:** `sudo journalctl -u whatsapp-bot -f`

**First run:** You need to scan QR once. Run manually first (`npm start`), scan, then stop and switch to the service.

---

## MongoDB Atlas (Required)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free account
2. Create a **free cluster** (M0)
3. **Database Access** → Add user (username + password)
4. **Network Access** → Add IP: `0.0.0.0/0` (allow from anywhere)
5. **Connect** → **Connect your application** → Copy the URI
6. Replace `<password>` in the URI with your user password

---

## Troubleshooting

**"Chrome/Chromium not found"** – Install deps: `sudo dnf install -y atk cups-libs gtk3 libXcomposite libXdamage libgbm`

**"Cannot connect to MongoDB"** – Check MongoDB Atlas: Network Access allows 0.0.0.0/0, password is correct in URI

**SSH timeout** – Ensure port 22 is open in Security List (Ingress Rules)

**Bot stops** – Use tmux or systemd service
