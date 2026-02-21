# WhatsApp Group Bot

A Node.js WhatsApp bot for managing group members, responding to messages, and automatically removing spammers.

## Features

- **Spam Detection & Removal** – Automatically detects users who send too many messages in a short time, warns them first, then removes repeat offenders
- **Group Management** – Kick, add, promote, and demote members (admin only)
- **Message Responses** – Commands like `!ping`, `!help`, `!info`
- **Session Persistence** – Uses LocalAuth so you only need to scan QR once

## Requirements

- **Node.js 18+**
- **WhatsApp account** (the bot will use your number)
- The bot must be **admin** in your group to remove members and use management commands

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure the bot** (optional)

   Edit `config.js` to adjust:
   - Command prefix (default: `!`)
   - Spam thresholds (max messages, time window)
   - Strict mode (remove immediately without warning)

3. **Run the bot**

   ```bash
   npm start
   ```

4. **Scan QR code**

   On first run, a QR code will appear in the terminal. Open WhatsApp on your phone → **Settings** → **Linked Devices** → **Link a Device** → Scan the QR code.

5. **Add the bot to your group**

   - Open WhatsApp on your phone
   - Open the group you want to add the bot to
   - Tap the group name at the top → **Add participants**
   - Search for or select the phone number that the bot is using (the number you scanned the QR code with)
   - Add them to the group
   - Make the bot an **admin** (tap group name → the bot → make admin) so it can remove spammers and run management commands

## Commands

| Command | Description | Who Can Use |
|---------|-------------|-------------|
| `!ping` | Check if bot is online | Everyone |
| `!help` | Show all commands | Everyone |
| `!info` | Group info (name, members, description) | Everyone |
| `!list` | List all group members | Admins only |
| `!kick @user` | Remove a member from the group | Admins only |
| `!add <phone>` | Add member by phone number (with country code) | Admins only |
| `!promote @user` | Make a member admin | Admins only |
| `!demote @user` | Remove admin from a member | Admins only |
| `!invite` | Get group invite link | Admins only |
| `!desc <text>` | Set group description | Admins only |

For `!kick`, `!promote`, and `!demote` you can:
- Mention the user: `!kick @John`
- Reply to their message and use the command
- Use their phone number: `!kick 1234567890`

## Scheduled Broadcast

The bot can send **different messages to different groups** every 15 minutes. Configure in `config.js`:

```javascript
broadcastEnabled: true,
broadcastIntervalMinutes: 15,
broadcastImagePath: 'WhatsApp Image 2026-02-20 at 10.37.41.jpeg',

// Different message for each group
broadcastGroups: [
  { groupId: '...@g.us', message: 'Message for group 1...', imagePath: 'image.jpeg' },
  { groupId: '...@g.us', message: 'Message for group 2...' },  // imagePath optional
],
```

Or use a single group (set `broadcastGroups: []` and use `broadcastGroupId` + `broadcastMessage`).

**To get group IDs:** Restart the bot—it lists all groups with IDs in the terminal when it starts.

## Welcome Messages

When new members join the group, the bot automatically sends a welcome message. Customize it in `config.js`:

```javascript
welcomeEnabled: true,
welcomeMessage: 'Welcome to the group, {{names}}! 👋 Feel free to introduce yourself.',
```

Use `{{names}}` as a placeholder—it will be replaced with the new member(s) name(s).

## Spam Protection

The bot tracks how many messages each user sends within a time window. Default settings:

- **Max messages:** 10
- **Time window:** 60 seconds
- **First offense:** Warning
- **Second offense:** Removal from group

Change these in `config.js`:

```javascript
spam: {
  maxMessages: 10,        // Messages allowed in time window
  timeWindowSeconds: 60,  // Time window in seconds
  firstOffense: 'warn',   // 'warn' or 'remove'
  secondOffense: 'remove',
  strictMode: false,      // true = remove immediately, no warning
}
```

## Restrict to Specific Groups

To run the bot only in certain groups, set in `config.js`:

```javascript
restrictToGroups: true,
allowedGroups: ['123456789-1234567890@g.us'],  // Add your group IDs
```

To get a group ID, you can add a temporary `console.log(chat.id._serialized)` when the bot receives a message from that group.

## Disclaimer

This bot uses [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js), an unofficial library. WhatsApp does not officially support bots. Use at your own risk. For business use, consider the [official WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/).

## Deploy 24/7

- **Replit:** See [REPLIT.md](REPLIT.md)
- **Replit failing?** See [DEPLOYMENT.md](DEPLOYMENT.md) for **Railway**, **Render**, **Oracle Cloud**, and **Fly.io**

## License

MIT
