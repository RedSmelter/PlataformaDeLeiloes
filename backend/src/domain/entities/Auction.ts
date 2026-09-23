export type AuctionCategory =
  | 'Eletrônicos'
  | 'Veículos'
  | 'Móveis'
  | 'Instrumentos Musicais'
  | 'Vestuário'
  | 'Esportes'
  | 'Outros'

export type AuctionStatus = 'open' | 'closed'

export interface Auction {
  id: string
  sellerId: string
  title: string
  description: string
  imageUrl: string | null
  category: AuctionCategory
  startingPrice: number
  currentPrice: number
  endsAt: Date
  status: AuctionStatus
  winnerId: string | null
  createdAt: Date
  bidsCount: number
}