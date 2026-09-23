import type { BidRepository, CreateBidInput } from '../../../domain/repositories/BidRepository.js'
import type { Bid } from '../../../domain/entities/Bid.js'

export class PlaceBid {
  private bidRepository: BidRepository

  constructor(bidRepository: BidRepository) {
    this.bidRepository = bidRepository
  }

  execute(input: CreateBidInput): Promise<Bid> {
    if (input.amount <= 0) {
      throw new Error('O valor do lance deve ser maior que zero')
    }

    return this.bidRepository.placeBid(input)
  }
}