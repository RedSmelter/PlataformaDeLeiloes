import type { Server } from 'socket.io'
import { CloseExpiredAuctions } from '../../application/use-cases/auction/CloseExpiredAuctions.js'
import { PostgresAuctionRepository } from '../../infrastructure/repositories/PostgresAuctionRepository.js'
import { PostgresBidRepository } from '../../infrastructure/repositories/PostgresBidRepository.js'

const auctionRepository = new PostgresAuctionRepository()
const bidRepository = new PostgresBidRepository()
const closeExpiredAuctions = new CloseExpiredAuctions(auctionRepository, bidRepository)

export function startAuctionCloserJob(io: Server, intervalMs = 5000) {
  setInterval(async () => {
    try {
      const closed = await closeExpiredAuctions.execute()

      for (const { auction, winnerBid } of closed) {
        io.to(`auction:${auction.id}`).emit('auction-closed', {
          auctionId: auction.id,
          winnerId: winnerBid?.userId ?? null,
          winnerName: winnerBid?.username ?? null,
          finalPrice: auction.currentPrice,
        })
      }
    } catch (error) {
      console.error('Erro ao fechar leilões expirados:', error)
    }
  }, intervalMs)
}