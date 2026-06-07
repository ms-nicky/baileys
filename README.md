# @ms-nicky/baileys

WhatsApp API library using WebSocket technology (multi-device). Fork of Baileys with additional features.

---

## Installation

```bash
npm install ms-nicky/baileys
```

---

## Usage

```javascript
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@ms-nicky/baileys')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return

    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    if (text === 'ping') {
      await sock.sendMessage(m.key.remoteJid, { text: 'pong' }, { quoted: m })
    }
  })
}

startBot()
```

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
      buttonParamsJson: JSON.stringify({
        display_text: 'Copy Code',
        id: '123',
        copy_code: 'ABC123'
      })
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
      messageParamsJson: JSON.stringify({
        bottom_sheet: {
          in_thread_buttons_limit: 2,
          list_title: 'Menu',
          button_title: 'Pilih'
        }
      }),
      buttons: [{
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: 'Pilih Opsi',
          sections: [{
            title: 'Section',
            rows: [{ title: 'Option 1', id: 'opt1' }]
          }]
        })
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
    buttons: [{
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: 'Buy Now',
        url: 'https://example.com/buy'
      })
    }]
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

### Group Status V2
```javascript
await sock.sendMessage(jid, {
  groupStatusMessage: { text: 'Hello World' }
})
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

// Add participants
await sock.groupParticipantsUpdate(jid, [participant1], 'add')

// Remove participants
await sock.groupParticipantsUpdate(jid, [participant1], 'remove')

// Promote to admin
await sock.groupParticipantsUpdate(jid, [participant1], 'promote')

// Demote admin
await sock.groupParticipantsUpdate(jid, [participant1], 'demote')

// Leave group
await sock.groupLeave(jid)

// Get invite code
const code = await sock.groupInviteCode(jid)

// Revoke invite code
await sock.groupRevokeInviteCode(jid)

// Set group settings
await sock.groupSettingUpdate(jid, 'announcement')  // or 'not_announcement'
await sock.groupSettingUpdate(jid, 'locked')         // or 'unlocked'

// Toggle ephemeral messages
await sock.groupToggleEphemeral(jid, 86400)  // 24 hours

// Label group
await sock.setLabelGroup(jid, 'label')
```

---

## Newsletter

```javascript
// Get newsletter info from URL
const info = await sock.newsletterFromUrl('https://whatsapp.com/channel/...')
console.log(info)
// { name, id, state, subscribers, verification, creation_time, description }
```

---

## Utility Functions

```javascript
// Check if number is on WhatsApp
const result = await sock.checkWhatsApp(jid)

// Block/unblock contact
await sock.updateBlockStatus(jid, 'block')    // or 'unblock'

// Update profile status
await sock.updateProfileStatus('New status')

// Update profile name
await sock.updateProfileName('New Name')

// Set profile picture
await sock.updateProfilePicture(jid, { url: 'https://example.com/photo.jpg' })

// Remove profile picture
await sock.removeProfilePicture(jid)

// Get business profile
const profile = await sock.getBusinessProfile(jid)
```

---

## Events

```javascript
// Connection update
sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
  if (connection === 'close') {
    // reconnect
  }
})

// Messages received
sock.ev.on('messages.upsert', ({ messages, type }) => {
  // handle incoming messages
})

// Presence update
sock.ev.on('presence.update', ({ id, presences }) => {
  // online, typing, recording, etc
})

// Group update
sock.ev.on('groups.update', (groups) => {
  // group metadata changes
})

// Credentials update
sock.ev.on('creds.update', saveCreds)
```

---

## Contact

- GitHub: [ms-nicky](https://github.com/ms-nicky)

---

## License

MIT
