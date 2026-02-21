/**
 * Bot Configuration
 * Customize these settings for your WhatsApp group bot
 */
module.exports = {
  // Command prefix (e.g., !help, !kick)
  prefix: '!',

  // Spam detection settings
  spam: {
    // Maximum messages allowed in the time window
    maxMessages: 10,
    // Time window in seconds (e.g., 10 messages in 60 seconds = spam)
    timeWindowSeconds: 60,
    // Action: 'warn' (send warning first) or 'remove' (remove immediately)
    firstOffense: 'warn',
    // Action on second offense within cooldown period
    secondOffense: 'remove',
    // Cooldown after warning before counter resets (seconds)
    warnCooldownSeconds: 300,
    // Set to true to auto-remove spammers without warning
    strictMode: false,
  },

  // Bot must be admin in groups to remove members
  // Set to true to only run in specific groups (add group IDs to allowedGroups)
  restrictToGroups: false,
  allowedGroups: [], // Add group IDs here if restrictToGroups is true

  // Welcome message for new members
  welcomeEnabled: true,
  welcomeMessage: `Welcome {{names}}! 👋

Welcome to the Mirola Enterprises Nigeria Appointment Setter application.

Kindly fill out the form below and someone will be in contact with you. 👇👇

https://forms.gle/MD5S751UxDaZ3wjFA

P.S. MAKE SURE TO JOIN OUR WHATSAPP CHANNEL FOR MORE INCOME EARNING OPPORTUNITIES. ⬇️⬇️
https://whatsapp.com/channel/0029Vb6gzhAKWEKhdjbiUY3Z

FOR A BETTER CHANCE TO BE NOTICED MAKE SURE TO FILL YOUR FORM ASAP

GOODLUCK & GODBLESS 💚`,
  // Use {{names}} as placeholder - it will be replaced with the new member(s) name(s)

  // Scheduled broadcast - sends message + image to groups every X minutes
  broadcastEnabled: true,
  broadcastIntervalMinutes: 15,
  // Default image (used when group doesn't specify its own)
  broadcastImagePath: 'WhatsApp Image 2026-02-20 at 10.37.41.jpeg',

  // Different messages for different groups - each group gets its own message
  // Leave empty [] to use the single-group config below for backward compatibility
  broadcastGroups: [
    {
      groupId: '120363425495626854@g.us',
      message: `Welcome to the Mirola Enterprises Nigeria Appointment Setter application.

Kindly fill out the form below and someone will be in contact with you. 👇👇

https://forms.gle/MD5S751UxDaZ3wjFA

P.S. MAKE SURE TO JOIN OUR WHATSAPP CHANNEL FOR MORE INCOME EARNING OPPORTUNITIES. ⬇️⬇️
https://whatsapp.com/channel/0029Vb6gzhAKWEKhdjbiUY3Z

FOR A BETTER CHANCE TO BE NOTICED MAKE SURE TO FILL YOUR FORM ASAP

GOODLUCK & GODBLESS 💚`,
      imagePath: 'WhatsApp Image 2026-02-20 at 10.37.41.jpeg', // optional - uses broadcastImagePath if omitted
    },
    {
      groupId: '120363423543424298@g.us',
      message: `Welcome to the Mirola Enterprises Nigeria Prayer Initiative Group

Kindly fill out the form below and someone will be in contact with you. 👇👇

https://forms.gle/u82ADRWtXCcTLbod9

P.S. MAKE SURE TO JOIN OUR WHATSAPP CHANNEL FOR MORE INCOME EARNING OPPORTUNITIES. ⬇️⬇️
https://whatsapp.com/channel/0029Vb6gzhAKWEKhdjbiUY3Z

FOR A BETTER CHANCE TO BE NOTICED MAKE SURE TO FILL YOUR FORM ASAP

GOODLUCK & GODBLESS 💚`,
      imagePath: null, // Text only - avoids "Waiting for this message" with image on some devices
    },
  ],

  // Single group (used only if broadcastGroups is empty)
  broadcastGroupId: '120363425495626854@g.us',
  broadcastMessage: `Welcome to the Mirola Enterprises Nigeria Appointment Setter application.

Kindly fill out the form below and someone will be in contact with you. 👇👇

https://forms.gle/MD5S751UxDaZ3wjFA

P.S. MAKE SURE TO JOIN OUR WHATSAPP CHANNEL FOR MORE INCOME EARNING OPPORTUNITIES. ⬇️⬇️
https://whatsapp.com/channel/0029Vb6gzhAKWEKhdjbiUY3Z

FOR A BETTER CHANCE TO BE NOTICED MAKE SURE TO FILL YOUR FORM ASAP

GOODLUCK & GODBLESS 💚`,

  // Content moderation - messages containing these words/phrases will be automatically deleted
  // Add phrases (case-insensitive) that should not be allowed in the group
  deleteMessagesWith: [
    // Negative feedback / refusal
    'sensitive details',
    'capital no',
    "can't drop",
    "can not drop",
    'company need to come up',
    'explanation about these',
    'i can\'t drop it',
    "i can't drop it",
    // Questioning company credibility
    'scam',
    'scamming',
    'fake company',
    'fraud',
    'not legitimate',
    'not legit',
    'question the credibility',
    'question credibility',
    'doubt the company',
    'suspicious',
    'red flag',
    'too good to be true',
    "don't trust",
    "can't trust",
    'is this a scam',
    'is this real',
    'is this legit',
    'seems like a scam',
    'looks like a scam',
    'sounds like a scam',
  ],
};
