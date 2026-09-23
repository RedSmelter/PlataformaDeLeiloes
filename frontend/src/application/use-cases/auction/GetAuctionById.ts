import type { AuctionRepository } from '../../../domain/repositories/AuctionRepository'
import type { Auction } from '../../../domain/entities/Auction'

export class GetAuctionById {
  private auctionRepository: AuctionRepository

  constructor(auctionRepository: AuctionRepository) {
    this.auctionRepository = auctionRepository
  }

  execute(id: string): Promise<Auction | null> {
    return this.auctionRepository.getById(id)
  }
}