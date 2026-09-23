import type { BidRepository, PlaceBidInput } from '../../../domain/repositories/BidRepository'
import type { Bid } from '../../../domain/entities/Bid'

export class PlaceBid {
  private bidRepository: BidRepository

  constructor(bidRepository: BidRepository) {
    this.bidRepository = bidRepository
  }

  execute(input: PlaceBidInput): Promise<Bid> {
    return this.bidRepository.placeBid(input)
  }
}