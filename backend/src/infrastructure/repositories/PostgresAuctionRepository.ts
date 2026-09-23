import { pool } from '../database/postgres.js'
import type { AuctionRepository, CreateAuctionInput } from '../../domain/repositories/AuctionRepository.js'
import type { Auction } from '../../domain/entities/Auction.js'

function mapRow(row: any): Auction {
  return {
    id: row.id,
    sellerId: row.seller_id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    category: row.category,
    startingPrice: Number(row.starting_price),
    currentPrice: Number(row.current_price),
    endsAt: row.ends_at,
    status: row.status,
    winnerId: row.winner_id,
    createdAt: row.created_at,
  }
}

export class PostgresAuctionRepository implements AuctionRepository {
  async findAll(): Promise<Auction[]> {
    const result = await pool.query('SELECT * FROM auctions ORDER BY created_at DESC')
    return result.rows.map(mapRow)
  }

  async findById(id: string): Promise<Auction | null> {
    const result = await pool.query('SELECT * FROM auctions WHERE id = $1', [id])
    if (result.rows.length === 0) return null
    return mapRow(result.rows[0])
  }

  async create(input: CreateAuctionInput): Promise<Auction> {
    const result = await pool.query(
      `INSERT INTO auctions (seller_id, title, description, image_url, category, starting_price, current_price, ends_at)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
       RETURNING *`,
      [
        input.sellerId,
        input.title,
        input.description,
        input.imageUrl,
        input.category,
        input.startingPrice,
        input.endsAt,
      ]
    )
    return mapRow(result.rows[0])
  }

  async updateCurrentPrice(id: string, newPrice: number): Promise<void> {
    await pool.query('UPDATE auctions SET current_price = $1 WHERE id = $2', [newPrice, id])
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM auctions WHERE id = $1', [id])
  }
}