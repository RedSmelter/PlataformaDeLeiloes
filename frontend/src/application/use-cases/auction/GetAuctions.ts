import type { AuctionRepository } from '../../../domain/repositories/AuctionRepository'
import type { Auction } from '../../../domain/entities/Auction'

export class GetAuctions {
  private auctionRepository: AuctionRepository

  constructor(auctionRepository: AuctionRepository) {
    this.auctionRepository = auctionRepository
  }

  execute(): Promise<Auction[]> {
    return this.auctionRepository.getAll()
  }
}