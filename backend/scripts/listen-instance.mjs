import { io } from 'socket.io-client'

const port = process.argv[2] ?? 3001
const auctionId = process.argv[3]

if (!auctionId) {
  console.error('Uso: node scripts/listen-instance.mjs <porta> <auctionId>')
  process.exit(1)
}

const socket = io(`http://localhost:${port}`)

socket.on('connect', () => {
  console.log(`Conectado na instância da porta ${port}`)
  socket.emit('join-auction', auctionId)
})

socket.on('new-bid', (bid) => {
  console.log('[via Redis Pub/Sub] Novo lance recebido:', bid)
})

socket.on('auction-closed', (payload) => {
  console.log('[via Redis Pub/Sub] Leilão encerrado:', payload)
})