import type { AuctionRepository } from '../../../domain/repositories/AuctionRepository.js'
import type { BidRepository } from '../../../domain/repositories/BidRepository.js'
import type { Auction } from '../../../domain/entities/Auction.js'
import type { Bid } from '../../../domain/entities/Bid.js'

export interface ClosedAuctionResult {
  auction: Auction
  winnerBid: Bid | null
}

export class CloseExpiredAuctions {
  private auctionRepository: AuctionRepository
  private bidRepository: BidRepository

  constructor(auctionRepository: AuctionRepository, bidRepository: BidRepository) {
    this.auctionRepository = auctionRepository
    this.bidRepository = bidRepository
  }

  async execute(): Promise<ClosedAuctionResult[]> {
    const expiredAuctions = await this.auctionRepository.findExpiredOpen()
    const results: ClosedAuctionResult[] = []

    for (const auction of expiredAuctions) {
      const bids = await this.bidRepository.findByAuctionId(auction.id)
      const winnerBid = bids[0] ?? null

      const closedHere = await this.auctionRepository.close(auction.id, winnerBid?.userId ?? null)

      // Outra instância já fechou este leilão entre o findExpiredOpen() e agora —
      // não duplica o evento de WebSocket nem a chamada gRPC.
      if (!closedHere) continue

      results.push({
        auction: { ...auction, status: 'closed', winnerId: winnerBid?.userId ?? null },
        winnerBid,
      })
    }

    return results
  }
}