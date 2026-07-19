require('./lib')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestWaWebVersion, makeCacheableSignalKeyStore } = require('./lib')
const { Boom } = require('@hapi/boom')
const pino = require('pino')
const readline = require('readline')

const phoneNumber = process.argv[2] || process.env.PHONE_NUMBER

if (!phoneNumber) {
  console.error('Usage: node pair.js <phone_number>')
  console.error('       or:  PHONE_NUMBER=628xxx node pair.js')
  process.exit(1)
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

async function start() {
  const { version, isLatest } = await fetchLatestWaWebVersion()
  console.log(`WA Web Version: ${version.join('.')} ${isLatest ? '(latest)' : '(fallback)'}`)

  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ['Chrome (Linux)', '', ''],
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('QR received (should not happen in pairing mode)')
    }

    if (connection === 'open') {
      console.log('\n✓ Connected to WhatsApp!')
      await sock.sendMessage(`${phoneNumber}@s.whatsapp.net`, {
        text: 'Bot Baileys berhasil terhubung via pairing code!',
      })
      console.log('✓ Test message sent!')
      process.exit(0)
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      const reason = lastDisconnect?.error?.output?.payload?.reason || code
      console.error(`\n✗ Connection closed: ${reason || 'unknown'}`)
      if (code !== DisconnectReason.loggedOut) {
        console.log('Retrying in 5s...')
        setTimeout(start, 5000)
      } else {
        console.log('Logged out. Delete auth_info folder and try again.')
        process.exit(1)
      }
    }
  })

  sock.ev.on('messages.upsert', ({ messages }) => {
    const msg = messages[0]
    if (msg.key.fromMe) return
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''
    console.log(`\n[${msg.key.remoteJid}] ${text}`)
  })

  console.log('Waiting for socket to open...')
  await new Promise(r => setTimeout(r, 2000))

  try {
    const pairingCode = await sock.requestPairingCode(phoneNumber)
    console.log(`\n╔══════════════════════════╗`)
    console.log(`║   Pairing Code: ${pairingCode}   ║`)
    console.log(`╚══════════════════════════╝`)
    console.log(`\nBuka WhatsApp > Linked Devices > Link a Device`)
    console.log(`Masukkan kode: ${pairingCode}\n`)
  } catch (err) {
    console.error(`\n✗ Pairing code failed: ${err.message}`)
    process.exit(1)
  }
}

start()
