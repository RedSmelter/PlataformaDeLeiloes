import type { AuctionRepository } from '../../../domain/repositories/AuctionRepository'

export class DeleteAuction {
  private auctionRepository: AuctionRepository

  constructor(auctionRepository: AuctionRepository) {
    this.auctionRepository = auctionRepository
  }

  execute(id: string): Promise<void> {
    return this.auctionRepository.remove(id)
  }
}