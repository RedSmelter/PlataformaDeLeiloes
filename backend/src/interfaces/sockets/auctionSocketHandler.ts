import type { Server } from 'socket.io'

export function registerAuctionSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    socket.on('join-auction', (auctionId: string) => {
      socket.join(`auction:${auctionId}`)
    })

    socket.on('leave-auction', (auctionId: string) => {
      socket.leave(`auction:${auctionId}`)
    })
  })
}