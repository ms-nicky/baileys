/**
 * call-test.js — Test VoIP call via @ms-nicky/baileys
 *
 * Usage:
 *   node call-test.js                     # call 6282143965467
 *   node call-test.js 62812xxxxx          # call specific number
 *   CALL_TARGET=628xxx node call-test.js
 *   AUTH_DIR=/path/to/auth node call-test.js
 */
const { createVoipClient, CallState, fetchLatestWaWebVersion } = require('./lib')
const pino = require('pino')

const TARGET = process.argv[2] || process.env.CALL_TARGET || '6282143965467'
const AUTH_DIR = process.env.AUTH_DIR || 'auth_info'
const DURATION_MS = parseInt(process.env.CALL_DURATION || '30000', 10)

async function main() {
  console.log(`\n╔══════════════════════════╗`)
  console.log(`║    VoIP Call Test        ║`)
  console.log(`╚══════════════════════════╝`)
  console.log(`Target: ${TARGET}`)
  console.log(`Auth:   ${AUTH_DIR}`)
  console.log(`Durasi: ${DURATION_MS / 1000}s\n`)

  const { version } = await fetchLatestWaWebVersion()
  console.log(`WA Version: ${version.join('.')}`)

  const client = await createVoipClient({ authDir: AUTH_DIR })
  console.log('✓ VoIP stack siap, memanggil...')

  const call = await client.call(TARGET, { durationMs: DURATION_MS })
  console.log(`✓ Panggilan dimulai (callId: ${call.callId})`)

  call.on('ringing', () => console.log('• Dering...'))
  call.on('connected', () => console.log('✓ Tersambung!'))
  call.on('ended', (reason) => {
    console.log(`• Panggilan berakhir: ${reason}`)
    client.disconnect()
    process.exit(0)
  })

  setTimeout(() => {
    console.log('\nTimeout, hangup...')
    call.end()
    setTimeout(() => { client.disconnect(); process.exit(0) }, 2000)
  }, DURATION_MS + 15000)
}

main().catch(err => {
  console.error(`✗ ${err.message}`)
  process.exit(1)
})
