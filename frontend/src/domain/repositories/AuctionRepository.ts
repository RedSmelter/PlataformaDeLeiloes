import type { Auction, AuctionCategory } from '../entities/Auction'

export interface CreateAuctionInput {
  title: string
  description: string
  category: AuctionCategory
  startingPrice: number
  endsAt: Date
}

export interface AuctionRepository {
  getAll(): Promise<Auction[]>
  getById(id: string): Promise<Auction | null>
  create(input: CreateAuctionInput): Promise<Auction>
  remove(id: string): Promise<void>
}