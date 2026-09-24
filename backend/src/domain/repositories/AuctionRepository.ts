import type { Auction, AuctionCategory } from '../entities/Auction.js'

export interface CreateAuctionInput {
  sellerId: string
  title: string
  description: string
  imageUrl: string | null
  category: AuctionCategory
  startingPrice: number
  endsAt: Date
}

export interface AuctionRepository {
  findAll(): Promise<Auction[]>
  findById(id: string): Promise<Auction | null>
  findExpiredOpen(): Promise<Auction[]>
  create(input: CreateAuctionInput): Promise<Auction>
  updateCurrentPrice(id: string, newPrice: number): Promise<void>
  close(id: string, winnerId: string | null): Promise<boolean>
  delete(id: string): Promise<void>
}