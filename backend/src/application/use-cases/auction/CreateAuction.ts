import type { AuctionRepository, CreateAuctionInput } from '../../../domain/repositories/AuctionRepository.ts'
import type { Auction } from '../../../domain/entities/Auction.ts'

export class CreateAuction {
  private auctionRepository: AuctionRepository

  constructor(auctionRepository: AuctionRepository) {
    this.auctionRepository = auctionRepository
  }

  execute(input: CreateAuctionInput): Promise<Auction> {
    if (input.startingPrice <= 0) {
      throw new Error('O preço inicial deve ser maior que zero')
    }

    if (input.endsAt.getTime() <= Date.now()) {
      throw new Error('A data de encerramento deve ser no futuro')
    }

    return this.auctionRepository.create(input)
  }
}