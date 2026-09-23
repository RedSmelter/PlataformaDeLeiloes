import type { BidRepository } from '../../../domain/repositories/BidRepository.js'
import type { Bid } from '../../../domain/entities/Bid.js'

export class GetBids {
  private bidRepository: BidRepository

  constructor(bidRepository: BidRepository) {
    this.bidRepository = bidRepository
  }

  execute(auctionId: string): Promise<Bid[]> {
    return this.bidRepository.findByAuctionId(auctionId)
  }
}