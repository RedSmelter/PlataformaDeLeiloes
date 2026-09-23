import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middlewares/authMiddleware.js'
import { GetAuctions } from '../../application/use-cases/auction/GetAuctions.js'
import { CreateAuction } from '../../application/use-cases/auction/CreateAuction.js'
import { DeleteAuction } from '../../application/use-cases/auction/DeleteAuction.js'
import { PostgresAuctionRepository } from '../../infrastructure/repositories/PostgresAuctionRepository.js'

const auctionRepository = new PostgresAuctionRepository()
const getAuctions = new GetAuctions(auctionRepository)
const createAuction = new CreateAuction(auctionRepository)
const deleteAuction = new DeleteAuction(auctionRepository)

export class AuctionController {
  async index(req: AuthenticatedRequest, res: Response) {
    const auctions = await getAuctions.execute()
    return res.status(200).json(auctions)
  }

  async show(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Parâmetro id inválido' })
    }

    const auction = await auctionRepository.findById(id)
    if (!auction) {
      return res.status(404).json({ message: 'Leilão não encontrado' })
    }
    return res.status(200).json(auction)
  }

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, imageUrl, category, startingPrice, endsAt } = req.body

      if (!title || !description || !category || !startingPrice || !endsAt) {
        return res.status(400).json({ message: 'Campos obrigatórios ausentes' })
      }

      const auction = await createAuction.execute({
        sellerId: req.userId!,
        title,
        description,
        imageUrl: imageUrl ?? null,
        category,
        startingPrice: Number(startingPrice),
        endsAt: new Date(endsAt),
      })

      return res.status(201).json(auction)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar leilão'
      return res.status(400).json({ message })
    }
  }

  async remove(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Parâmetro id inválido' })
    }

    await deleteAuction.execute(id)
    return res.status(204).send()
  }
}