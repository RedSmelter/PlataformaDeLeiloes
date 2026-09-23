import type { AuctionRepository, CreateAuctionInput } from '../../../domain/repositories/AuctionRepository'
import type { Auction } from '../../../domain/entities/Auction'

export class CreateAuction {
  private auctionRepository: AuctionRepository

  constructor(auctionRepository: AuctionRepository) {
    this.auctionRepository = auctionRepository
  }

  execute(input: CreateAuctionInput): Promise<Auction> {
    return this.auctionRepository.create(input)
  }
}