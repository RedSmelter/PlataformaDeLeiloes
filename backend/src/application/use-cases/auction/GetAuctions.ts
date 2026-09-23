import type { AuctionRepository } from '../../../domain/repositories/AuctionRepository.js'
import type { Auction } from '../../../domain/entities/Auction.js'

export class GetAuctions {
  private auctionRepository: AuctionRepository

  constructor(auctionRepository: AuctionRepository) {
    this.auctionRepository = auctionRepository
  }

  execute(): Promise<Auction[]> {
    return this.auctionRepository.findAll()
  }
}