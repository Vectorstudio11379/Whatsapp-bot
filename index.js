try { require('dotenv').config(); } catch (_) {}
const { Client, LocalAuth, RemoteAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const SpamDetector = require('./spam-detector');

// Replit: use RemoteAuth with MongoDB. Local: use LocalAuth.
const useRemoteAuth = !!process.env.MONGODB_URI;

// Find Chrome/Chromium executable (local Windows only - Replit uses Puppeteer's Chromium)
function getChromePath() {
  if (process.platform === 'win32') {
    const paths = [
      path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    ];
    for (const p of paths) {
      if (p && fs.existsSync(p)) return p;
    }
  }
  return undefined;
}

const chromePath = useRemoteAuth ? undefined : getChromePath();
if (chromePath) {
  console.log('Using Chrome at:', chromePath);
} else if (useRemoteAuth) {
  console.log('Replit mode: Using Puppeteer Chromium');
} else if (process.platform === 'win32') {
  console.log('Chrome/Edge not found. Install Google Chrome, or run: npx puppeteer browsers install chrome');
}

// Initialize spam detector
const spamDetector = new SpamDetector(config.spam);

const puppeteerConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
  ],
};
if (chromePath) {
  puppeteerConfig.executablePath = chromePath;
}

async function createClient() {
  let authStrategy;
  if (useRemoteAuth) {
    const mongoose = require('mongoose');
    const { MongoStore } = require('wwebjs-mongo');
    await mongoose.connect(process.env.MONGODB_URI);
    const store = new MongoStore({ mongoose });
    authStrategy = new RemoteAuth({
      store,
      backupSyncIntervalMs: 300000,
    });
    console.log('Using MongoDB for session (Replit)');
  } else {
    authStrategy = new LocalAuth({ dataPath: './.wwebjs_auth' });
  }

  return new Client({
    authStrategy,
    puppeteer: puppeteerConfig,
  });
}

let client;

async function main() {
  client = await createClient();

  // QR Code for first-time login
  client.on('qr', (qr) => {
    console.log('\n📱 Scan this QR code with WhatsApp on your phone:\n');
    qrcode.generate(qr, { small: true });
    // Cloud/Railway: terminal QR may not render - open this URL in your browser to scan
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
    console.log('\n🔗 Or open this URL in your browser to see the QR code:\n', qrUrl, '\n');
  });

client.on('ready', async () => {
  console.log('✅ Bot is ready! Connected to WhatsApp.');

  // List all groups with their IDs (so you can copy the ID for broadcastGroupId)
  try {
    const chats = await client.getChats();
    const groups = chats.filter((c) => c.isGroup);
    console.log('\n📋 GROUPS THE BOT IS IN (copy ID for config.js broadcastGroupId):\n');
    groups.forEach((g, i) => {
      console.log(`  ${i + 1}. "${g.name}"`);
      console.log(`     ID: ${g.id._serialized}\n`);
    });
    console.log('---\n');
  } catch (err) {
    console.error('Could not list groups:', err.message);
  }

  // Scheduled broadcast - send message + image to groups every X minutes
  const hasBroadcastGroups = config.broadcastGroups?.length > 0;
  const hasSingleGroup = config.broadcastGroupId && config.broadcastMessage;

  if (config.broadcastEnabled && config.broadcastIntervalMinutes > 0 && (hasBroadcastGroups || hasSingleGroup)) {
    const runBroadcast = async () => {
      const defaultImagePath = path.isAbsolute(config.broadcastImagePath)
        ? config.broadcastImagePath
        : path.join(__dirname, config.broadcastImagePath);

      const targets = hasBroadcastGroups
        ? config.broadcastGroups
        : [{ groupId: config.broadcastGroupId, message: config.broadcastMessage, imagePath: config.broadcastImagePath }];

      for (const target of targets) {
        try {
          const chat = await client.getChatById(target.groupId);
          if (!chat || !chat.isGroup) {
            console.error('Broadcast: Invalid group ID or not a group:', target.groupId);
            continue;
          }

          const imgPath = target.imagePath
            ? (path.isAbsolute(target.imagePath) ? target.imagePath : path.join(__dirname, target.imagePath))
            : defaultImagePath;

          let media = null;
          if (fs.existsSync(imgPath)) {
            media = MessageMedia.fromFilePath(imgPath);
          } else {
            const altPath = imgPath.replace(/\.jpeg$/i, '.jpg');
            if (fs.existsSync(altPath)) media = MessageMedia.fromFilePath(altPath);
          }

          if (media) {
            await chat.sendMessage(media, { caption: target.message });
          } else {
            await chat.sendMessage(target.message);
          }
          console.log('Broadcast sent to:', chat.name);
        } catch (err) {
          console.error('Broadcast failed for', target.groupId, ':', err.message);
        }
      }
    };

    const targets = hasBroadcastGroups
      ? config.broadcastGroups
      : [{ groupId: config.broadcastGroupId, message: config.broadcastMessage, imagePath: config.broadcastImagePath }];

    runBroadcast(); // Send immediately on startup
    setInterval(runBroadcast, config.broadcastIntervalMinutes * 60 * 1000);
    console.log(`📢 Broadcast scheduled every ${config.broadcastIntervalMinutes} min to ${targets.length} group(s)`);
  } else if (config.broadcastEnabled && !hasBroadcastGroups && !hasSingleGroup) {
    console.log('📢 Broadcast enabled but no groups configured. Add broadcastGroups or broadcastGroupId in config.js');
  }
});

client.on('authenticated', () => {
  console.log('🔐 Authentication successful!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
  console.log('⚠️ Client disconnected:', reason);
});

// Welcome new members when they join the group
client.on('group_join', async (notification) => {
  if (!config.welcomeEnabled) return;
  try {
    const recipients = await notification.getRecipients();
    if (recipients.length === 0) return;
    const names = recipients.map((c) => c.pushname || c.number || 'there').join(', ');
    const message = config.welcomeMessage.replace(/\{\{names\}\}/g, names);
    await notification.reply(message);
  } catch (err) {
    console.error('Error sending welcome message:', err.message);
  }
});

// Handle incoming messages
client.on('message', async (msg) => {
  try {
    // Ignore the bot's own messages
    if (msg.fromMe) return;

    // Content moderation - delete messages containing blocked phrases
    if (config.deleteMessagesWith && config.deleteMessagesWith.length > 0) {
      const body = (msg.body || '').toLowerCase();
      const shouldDelete = config.deleteMessagesWith.some(
        (phrase) => phrase && body.includes(phrase.toLowerCase())
      );
      if (shouldDelete) {
        try {
          await msg.delete(true, true);
          console.log('Deleted moderated message');
        } catch (err) {
          console.error('Could not delete message (is bot admin?):', err.message);
        }
        return;
      }
    }

    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const isGroup = chat.isGroup;
    const groupId = isGroup ? chat.id._serialized : null;

    // Log group ID to terminal (send any message in group, check the console below)
    if (isGroup) {
      console.log('\n📌 GROUP ID:', groupId, '| Group:', chat.name, '\n');
    }
    const userId = msg.author || msg.from;

    // Check if we should process this group
    if (config.restrictToGroups && isGroup && !config.allowedGroups.includes(groupId)) {
      return;
    }

    // Spam detection for group messages (skip bot's own messages and commands)
    if (isGroup && !msg.fromMe) {
      const spamResult = spamDetector.recordMessage(groupId, userId);

      if (spamResult.isSpam) {
        const shouldRemove = spamDetector.shouldRemove(spamResult);

        if (shouldRemove) {
          try {
            await chat.removeParticipants([userId]);
            await chat.sendMessage(
              `⚠️ *Spam Alert*\n\n${contact.pushname || 'A member'} has been removed for excessive messaging (${spamResult.count} messages in ${config.spam.timeWindowSeconds} seconds).`
            );
            spamDetector.resetUser(groupId, userId);
          } catch (err) {
            console.error('Could not remove spammer (is bot admin?):', err.message);
            await chat.sendMessage(
              '⚠️ Spam detected but I cannot remove members. Please make me a group admin.'
            );
          }
        } else if (!spamResult.warned) {
          spamDetector.markWarned(groupId, userId);
          await msg.reply(
            `⚠️ *Spam Warning*\n\nYou've sent ${spamResult.count} messages in ${config.spam.timeWindowSeconds} seconds. Please slow down or you may be removed from the group.`
          );
        }
        return; // Don't process commands when spamming
      }
    }

    // Command handling
    const body = (msg.body || '').trim();
    if (!body.startsWith(config.prefix)) return;

    const args = body.slice(config.prefix.length).trim().split(/\s+/);
    const command = args[0]?.toLowerCase();

    if (!command) return;

    // Only admins can use management commands (check if message sender is admin)
    let isAdmin = true;
    if (isGroup) {
      try {
        const participants = chat.participants || [];
        const participantsArray = Array.isArray(participants) ? participants : [...participants];
        const participant = participantsArray.find((p) => {
          const id = p.id && (p.id._serialized || p.id);
          return id === userId;
        });
        isAdmin = participant ? (participant.isAdmin || participant.isSuperAdmin) : false;
      } catch (e) {
        console.error('Error checking admin status:', e.message);
        isAdmin = false;
      }
    }

    switch (command) {
      case 'ping':
        await msg.reply('🏓 Pong! Bot is online.');
        break;

      case 'help':
        await sendHelp(msg, isGroup, isAdmin);
        break;

      case 'info':
        if (isGroup) {
          const participants = Array.isArray(chat.participants) ? chat.participants : [...(chat.participants || [])];
          const groupIdForInfo = chat.id._serialized;
          await msg.reply(
            `📋 *Group Info*\n\n` +
              `Name: ${chat.name}\n` +
              `Members: ${participants.length}\n` +
              `Description: ${chat.description || 'N/A'}\n\n` +
              `🆔 *Group ID:* \`${groupIdForInfo}\`\n_(Copy for config.js broadcastGroupId)_`
          );
        } else {
          await msg.reply(`👤 You're chatting in a private conversation.`);
        }
        break;

      case 'groupid':
        if (isGroup) {
          const groupId = chat.id._serialized;
          await msg.reply(
            `🆔 *Group ID for broadcast config:*\n\n\`${groupId}\`\n\nCopy this and paste it in config.js as broadcastGroupId.`
          );
        } else {
          await msg.reply('❌ This command only works in a group.');
        }
        break;

      case 'list':
        if (isGroup && isAdmin) {
          const participants = Array.isArray(chat.participants) ? chat.participants : [...(chat.participants || [])];
          const list = participants
            .map((p, i) => `${i + 1}. ${p.pushname || p.id?.user || (p.id && p.id.user) || 'Unknown'}`)
            .join('\n');
          await msg.reply(`📋 *Group Members*\n\n${list || 'No members'}`);
        } else {
          await msg.reply('❌ This command is for group admins only.');
        }
        break;

      case 'kick':
        if (isGroup && isAdmin) {
          const target = args[1]; // Can be @mention or number
          if (!target) {
            await msg.reply('Usage: !kick @mention or !kick phone_number');
            return;
          }
          let targetId = target;
          if (msg.hasQuotedMsg) {
            const quoted = await msg.getQuotedMessage();
            targetId = quoted.author || quoted.from;
          } else if (target.startsWith('@')) {
            const mentioned = await msg.getMentions();
            if (mentioned.length > 0) targetId = mentioned[0].id._serialized;
          } else if (target.includes('@')) {
            targetId = target;
          } else {
            targetId = target.replace(/\D/g, '') + '@c.us';
          }
          try {
            await chat.removeParticipants([targetId]);
            await msg.reply('✅ Member has been removed from the group.');
          } catch (err) {
            await msg.reply(`❌ Could not remove: ${err.message}`);
          }
        } else {
          await msg.reply('❌ This command is for group admins only.');
        }
        break;

      case 'add':
        if (isGroup && isAdmin) {
          const number = args[1];
          if (!number) {
            await msg.reply('Usage: !add phone_number (with country code, no +)');
            return;
          }
          const phone = number.replace(/\D/g, '') + '@c.us';
          try {
            await chat.addParticipants([phone]);
            await msg.reply('✅ Invitation sent to add the member.');
          } catch (err) {
            await msg.reply(`❌ Could not add: ${err.message}`);
          }
        } else {
          await msg.reply('❌ This command is for group admins only.');
        }
        break;

      case 'promote':
        if (isGroup && isAdmin) {
          const target = args[1];
          if (!target) {
            await msg.reply('Usage: !promote @mention or phone_number');
            return;
          }
          const targetId = await resolveTargetId(msg, target);
          try {
            await chat.promoteParticipants([targetId]);
            await msg.reply('✅ Member has been promoted to admin.');
          } catch (err) {
            await msg.reply(`❌ Could not promote: ${err.message}`);
          }
        } else {
          await msg.reply('❌ This command is for group admins only.');
        }
        break;

      case 'demote':
        if (isGroup && isAdmin) {
          const target = args[1];
          if (!target) {
            await msg.reply('Usage: !demote @mention or phone_number');
            return;
          }
          const targetId = await resolveTargetId(msg, target);
          try {
            await chat.demoteParticipants([targetId]);
            await msg.reply('✅ Admin has been demoted.');
          } catch (err) {
            await msg.reply(`❌ Could not demote: ${err.message}`);
          }
        } else {
          await msg.reply('❌ This command is for group admins only.');
        }
        break;

      case 'invite':
        if (isGroup && isAdmin) {
          try {
            const inviteCode = await chat.getInviteCode();
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
            await msg.reply(`📨 Group invite link:\n${inviteLink}`);
          } catch (err) {
            await msg.reply(`❌ Could not get invite: ${err.message}`);
          }
        } else {
          await msg.reply('❌ This command is for group admins only.');
        }
        break;

      case 'desc':
        if (isGroup && isAdmin) {
          const newDesc = args.slice(1).join(' ');
          if (!newDesc) {
            await msg.reply('Usage: !desc New group description');
            return;
          }
          try {
            await chat.setDescription(newDesc);
            await msg.reply('✅ Group description updated.');
          } catch (err) {
            await msg.reply(`❌ Could not update: ${err.message}`);
          }
        } else {
          await msg.reply('❌ This command is for group admins only.');
        }
        break;

      default:
        await msg.reply(`Unknown command. Type ${config.prefix}help for available commands.`);
    }
  } catch (err) {
    console.error('Error handling message:', err.message || err);
    try {
      await msg.reply('❌ An error occurred. Please try again.');
    } catch (_) {}
  }
});

async function resolveTargetId(msg, target) {
  if (msg.hasQuotedMsg) {
    const quoted = await msg.getQuotedMessage();
    return quoted.author || quoted.from;
  }
  if (target.startsWith('@')) {
    const mentioned = await msg.getMentions();
    if (mentioned.length > 0) return mentioned[0].id._serialized;
  }
  if (target.includes('@')) return target;
  return target.replace(/\D/g, '') + '@c.us';
}

async function sendHelp(msg, isGroup, isAdmin) {
  let helpText =
    `🤖 *WhatsApp Group Bot*\n\n` +
    `*General Commands:*\n` +
    `${config.prefix}ping - Check if bot is online\n` +
    `${config.prefix}help - Show this help\n` +
    `${config.prefix}info - Group info\n` +
    `${config.prefix}groupid - Get group ID (for broadcast config)\n\n`;

  if (isGroup && isAdmin) {
    helpText +=
      `*Admin Commands:*\n` +
      `${config.prefix}list - List all members\n` +
      `${config.prefix}kick @user - Remove a member\n` +
      `${config.prefix}add <number> - Add member by phone\n` +
      `${config.prefix}promote @user - Make admin\n` +
      `${config.prefix}demote @user - Remove admin\n` +
      `${config.prefix}invite - Get group invite link\n` +
      `${config.prefix}desc <text> - Set group description\n\n`;
  }

  helpText +=
    `*Spam Protection:*\n` +
    `Automatically warns/removes users who send too many messages in a short time.\n` +
    `(Configure in config.js)`;

  await msg.reply(helpText);
}

  // Graceful shutdown
  process.on('SIGINT', () => {
    spamDetector.destroy();
    if (client) client.destroy();
    process.exit(0);
  });

  client.initialize();
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
