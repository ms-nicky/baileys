# @ms-nicky/baileys

WhatsApp API library using WebSocket technology (multi-device).  
Fork of [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) with pairing code fixes and auto version detection.

---

## Installation

```bash
npm install github:ms-nicky/baileys
```

Or in `package.json`:

```json
"@whiskeysockets/baileys": "github:ms-nicky/baileys"
```

---

## Quick Start

### Pairing Code (Recommended)

```javascript
const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion, makeCacheableSignalKeyStore } = require('@ms-nicky/baileys')
const pino = require('pino')

async function start() {
  const { version } = await fetchLatestWaWebVersion()
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    printQRInTerminal: false,
    browser: ['Chrome (Linux)', '', ''],
  })

  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') console.log('✓ Connected')
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      if (code !== 401) setTimeout(start, 5000)
    }
  })

  // Generate & display pairing code
  const code = await sock.requestPairingCode('62812xxxxxxx')
  console.log(`Pairing code: ${code}`)
}

start()
```

### Using the included pair script

```bash
node pair.js 62812xxxxxxx
```

The script will display the pairing code, then send a test message once connected.

---

## Key Features

### Auto Version Detection

Fetches the latest WhatsApp Web version from [WPPConnect](https://wppconnect.io/whatsapp-versions) at startup. Falls back to a hardcoded version if the fetch fails.

```javascript
const { version, isLatest } = await fetchLatestWaWebVersion()
```

### Pairing Code Fix

- Validates phone number (international format, rejects leading `0`)
- Waits for Noise handshake to complete before sending pairing IQ
- Uses random nonce instead of hardcoded `"0"`
- Supports custom pairing key

```javascript
const code = await sock.requestPairingCode('62812xxxxxxx')
const code = await sock.requestPairingCode('62812xxxxxxx', 'CUSTOMKEY')
```

### 405 Error Recovery

Automatically detects `405 Method Not Allowed` errors from WhatsApp and retries the connection.

---

## SendMessage

### Text
```javascript
await sock.sendMessage(jid, { text: 'Hello World' })
```

### Image
```javascript
await sock.sendMessage(jid, { image: { url: 'https://example.com/image.jpg' }, caption: 'Caption' })
```

### Video
```javascript
await sock.sendMessage(jid, { video: { url: 'https://example.com/video.mp4' }, caption: 'Caption' })
```

### Audio
```javascript
await sock.sendMessage(jid, { audio: { url: 'https://example.com/audio.mp3' }, mimetype: 'audio/mp4', ptt: true })
```

### Document
```javascript
await sock.sendMessage(jid, { document: fs.readFileSync('./file.pdf'), mimetype: 'application/pdf', fileName: 'file.pdf' })
```

### Sticker
```javascript
await sock.sendMessage(jid, { sticker: { url: 'https://example.com/image.webp' } })
```

### Location
```javascript
await sock.sendMessage(jid, { location: { degreesLatitude: -6.2, degreesLongitude: 106.8 } })
```

### Contact
```javascript
await sock.sendMessage(jid, { contacts: { displayName: 'Alice', contacts: [{ vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:Alice\nEND:VCARD' }] } })
```

### Poll
```javascript
await sock.sendMessage(jid, {
  poll: {
    name: 'Pilihan',
    values: ['A', 'B', 'C'],
    selectableCount: 1
  }
})
```

### List
```javascript
await sock.sendMessage(jid, {
  list: {
    title: 'Menu',
    text: 'Pilih opsi:',
    buttonText: 'Lihat',
    sections: [{
      title: 'Section',
      rows: [{ title: 'Option 1', description: 'Desc', rowId: 'opt1' }]
    }]
  }
})
```

### Buttons
```javascript
await sock.sendMessage(jid, {
  buttons: [
    { buttonId: 'btn1', buttonText: { displayText: 'Button 1' }, type: 1 }
  ],
  header: 'Header',
  text: 'Text',
  footer: 'Footer'
})
```

---

## Additional Features

### Album Message (Multiple Images)
```javascript
await sock.sendMessage(jid, {
  albumMessage: [
    { image: fs.readFileSync('./img1.jpg'), caption: 'Photo 1' },
    { image: { url: 'https://example.com/img.jpg' }, caption: 'Photo 2' }
  ]
})
```

### Interactive Message
```javascript
await sock.sendMessage(jid, {
  interactiveMessage: {
    header: 'Header',
    title: 'Title',
    footer: 'Footer',
    buttons: [{
      name: 'cta_copy',
      buttonParamsJson: JSON.stringify({ display_text: 'Copy Code', id: '123', copy_code: 'ABC123' })
    }]
  }
})
```

### Native Flow Message
```javascript
await sock.sendMessage(jid, {
  interactiveMessage: {
    header: 'Header',
    title: 'Title',
    footer: 'Footer',
    nativeFlowMessage: {
      messageParamsJson: JSON.stringify({ bottom_sheet: { in_thread_buttons_limit: 2, list_title: 'Menu', button_title: 'Pilih' } }),
      buttons: [{
        name: 'single_select',
        buttonParamsJson: JSON.stringify({ title: 'Pilih Opsi', sections: [{ title: 'Section', rows: [{ title: 'Option 1', id: 'opt1' }] }] })
      }]
    }
  }
})
```

### Event Message
```javascript
await sock.sendMessage(jid, {
  eventMessage: {
    isCanceled: false,
    name: 'Event Name',
    description: 'Description',
    location: { degreesLatitude: 0, degreesLongitude: 0, name: 'Location' },
    startTime: String(Math.floor(Date.now() / 1000)),
    endTime: String(Math.floor(Date.now() / 1000) + 3600)
  }
})
```

### Poll Result Message
```javascript
await sock.sendMessage(jid, {
  pollResultMessage: {
    name: 'Poll Name',
    pollVotes: [
      { optionName: 'A', optionVoteCount: '10' },
      { optionName: 'B', optionVoteCount: '5' }
    ]
  }
})
```

### Product Message
```javascript
await sock.sendMessage(jid, {
  productMessage: {
    title: 'Product',
    description: 'Description',
    thumbnail: { url: 'https://example.com/img.jpg' },
    productId: 'PROD001',
    retailerId: 'RETAIL001',
    priceAmount1000: 50000,
    currencyCode: 'IDR',
    buttons: [{ name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'Buy Now', url: 'https://example.com/buy' }) }]
  }
})
```

### Request Payment Message
```javascript
await sock.sendMessage(jid, {
  requestPaymentMessage: {
    currency: 'IDR',
    amount: 100000,
    from: m.sender,
    background: { id: '100', fileLength: '0', width: 1000, height: 1000, mimetype: 'image/webp', placeholderArgb: 0xFF00FFFF, textArgb: 0xFFFFFFFF, subtextArgb: 0xFFAA00FF }
  }
})
```

### Status Mention
```javascript
await sock.sendStatusMention('Hello', jid)
```

---

## Group Functions

```javascript
// Create group
const group = await sock.groupCreate('Group Name', [participant1, participant2])

// Update subject
await sock.groupUpdateSubject(jid, 'New Subject')

// Update description
await sock.groupUpdateDescription(jid, 'New Description')

// Add / Remove participants
await sock.groupParticipantsUpdate(jid, [participant1], 'add')
await sock.groupParticipantsUpdate(jid, [participant1], 'remove')

// Promote / Demote admin
await sock.groupParticipantsUpdate(jid, [participant1], 'promote')
await sock.groupParticipantsUpdate(jid, [participant1], 'demote')

// Leave group
await sock.groupLeave(jid)

// Invite code
const code = await sock.groupInviteCode(jid)
await sock.groupRevokeInviteCode(jid)

// Settings
await sock.groupSettingUpdate(jid, 'announcement')   // or 'not_announcement'
await sock.groupSettingUpdate(jid, 'locked')          // or 'unlocked'

// Ephemeral messages
await sock.groupToggleEphemeral(jid, 86400)

// Label group
await sock.setLabelGroup(jid, 'label')
```

---

## Newsletter

```javascript
const info = await sock.newsletterFromUrl('https://whatsapp.com/channel/...')
console.log(info) // { name, id, state, subscribers, verification, creation_time, description }
```

---

## Utility Functions

```javascript
// Check if number is on WhatsApp
const result = await sock.checkWhatsApp(jid)

// Block/unblock
await sock.updateBlockStatus(jid, 'block')
await sock.updateBlockStatus(jid, 'unblock')

// Update profile status
await sock.updateProfileStatus('New status')

// Update profile name
await sock.updateProfileName('New Name')

// Set/remove profile picture
await sock.updateProfilePicture(jid, { url: 'https://example.com/photo.jpg' })
await sock.removeProfilePicture(jid)

// Get business profile
const profile = await sock.getBusinessProfile(jid)
```

---

## Events

```javascript
// Connection update
sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
  if (connection === 'open') console.log('Connected')
  if (connection === 'close') {
    // reconnect logic
  }
})

// Messages
sock.ev.on('messages.upsert', ({ messages, type }) => {
  // handle incoming messages
})

// Presence
sock.ev.on('presence.update', ({ id, presences }) => {
  // online, typing, recording, etc
})

// Group update
sock.ev.on('groups.update', (groups) => {
  // group metadata changes
})

// Credentials
sock.ev.on('creds.update', saveCreds)
```

---

## Contact

- GitHub: [ms-nicky](https://github.com/ms-nicky)
- Telegram: [t.me/MsXploiter](https://t.me/MsXploiter)

---

## License

MIT
