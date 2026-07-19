require('./lib')
const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion, makeCacheableSignalKeyStore, DisconnectReason } = require('./lib')
const { Boom } = require('@hapi/boom')
const pino = require('pino')

const phoneNumber = process.argv[2] || process.env.PHONE_NUMBER
const customCode = process.argv[3] || process.env.PAIR_CODE || ''
const authDir = process.env.AUTH_DIR || 'auth_info'

if (!phoneNumber) {
  console.error('Usage: node pair.js <phone_number> [custom_code]')
  console.error('       or:  PHONE_NUMBER=628xxx node pair.js')
  console.error('')
  console.error('Examples:')
  console.error('  node pair.js 6282143965467')
  console.error('  node pair.js 6282143965467 ELAINA13')
  process.exit(1)
}

async function start() {
  const { version, isLatest } = await fetchLatestWaWebVersion()
  console.log(`WA Web Version: ${version.join('.')} ${isLatest ? '(latest)' : '(fallback)'}`)

  const { state, saveCreds } = await useMultiFileAuthState(authDir)

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ['Linux', 'Chrome', ''],
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('QR received (pairing should be used instead)')
    }

    if (connection === 'open') {
      console.log('\n✓ Connected to WhatsApp!')
      process.exit(0)
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = code === 515 || code === DisconnectReason?.restartRequired
      if (shouldReconnect) {
        console.log('\n🔄 Pairing accepted, reconnecting...')
        start()
      } else if (code === DisconnectReason.loggedOut) {
        console.error('\n✗ Logged out. Hapus folder', authDir, 'dan coba lagi.')
        process.exit(1)
      } else {
        console.error(`\n✗ Connection closed: ${code || 'unknown'}`)
        process.exit(1)
      }
    }
  })

  console.log('Connecting...')
  await new Promise(r => setTimeout(r, 2000))

  try {
    const pairingCode = await sock.requestPairingCode(phoneNumber, customCode || undefined)
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
