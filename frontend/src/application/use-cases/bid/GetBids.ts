import type { BidRepository } from '../../../domain/repositories/BidRepository'
import type { Bid } from '../../../domain/entities/Bid'

export class GetBids {
  private bidRepository: BidRepository

  constructor(bidRepository: BidRepository) {
    this.bidRepository = bidRepository
  }

  execute(auctionId: string): Promise<Bid[]> {
    return this.bidRepository.getByAuctionId(auctionId)
  }
}