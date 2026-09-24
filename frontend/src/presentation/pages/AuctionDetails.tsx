import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BidList from '../components/BidList'
import { isAuctionClosed } from '../../domain/entities/Auction'
import { GetAuctionById } from '../../application/use-cases/auction/GetAuctionById'
import { GetBids } from '../../application/use-cases/bid/GetBids'
import { PlaceBid } from '../../application/use-cases/bid/PlaceBid'
import { HttpAuctionRepository } from '../../infrastructure/repositories/HttpAuctionRepository'
import { HttpBidRepository } from '../../infrastructure/repositories/HttpBidRepository'
import { ApiError } from '../../infrastructure/http/api'
import { mapToBid } from '../../infrastructure/http/bidMapper'
import type { BidApiResponse } from '../../infrastructure/http/bidMapper'
import { getSocket } from '../../infrastructure/webSocket/socket.js'
import type { Auction } from '../../domain/entities/Auction'
import type { Bid } from '../../domain/entities/Bid'

const auctionRepository = new HttpAuctionRepository()
const bidRepository = new HttpBidRepository()
const getAuctionById = new GetAuctionById(auctionRepository)
const getBids = new GetBids(bidRepository)
const placeBid = new PlaceBid(bidRepository)

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatEndsAt(date: Date) {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AuctionDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [auction, setAuction] = useState<Auction | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [bidError, setBidError] = useState<string | null>(null)
  const [isBidding, setIsBidding] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!id) return

      try {
        const [auctionResult, bidsResult] = await Promise.all([
          getAuctionById.execute(id),
          getBids.execute(id),
        ])

        setAuction(auctionResult)
        setBids(bidsResult)
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Erro ao carregar leilão'
        setLoadError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  // Conexão em tempo real: entra na sala do leilão e escuta novos lances.
  useEffect(() => {
    if (!id) return

    const socket = getSocket()
    socket.emit('join-auction', id)

    function handleNewBid(payload: BidApiResponse) {
      const bid = mapToBid(payload)

      setBids((prev) => {
        if (prev.some((b) => b.id === bid.id)) return prev
        return [bid, ...prev]
      })

      setAuction((prev) => (prev ? { ...prev, currentBid: bid.amount } : prev))
    }

    socket.on('new-bid', handleNewBid)

    return () => {
      socket.emit('leave-auction', id)
      socket.off('new-bid', handleNewBid)
    }
  }, [id])

  const [, forceRerender] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => forceRerender((n) => n + 1), 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
  if (!id) return

  const socket = getSocket()

  function handleAuctionClosed(payload: { auctionId: string; finalPrice: number }) {
    if (payload.auctionId !== id) return
    setAuction((prev) => (prev ? { ...prev, status: 'closed', currentBid: payload.finalPrice } : prev))
  }

  socket.on('auction-closed', handleAuctionClosed)

  return () => {
    socket.off('auction-closed', handleAuctionClosed)
  }
}, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <Alert severity="error">{loadError}</Alert>
        <Button variant="contained" onClick={() => navigate('/auctions')}>
          Voltar para leilões
        </Button>
      </div>
    )
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Typography variant="h6">Leilão não encontrado.</Typography>
        <Button variant="contained" onClick={() => navigate('/auctions')}>
          Voltar para leilões
        </Button>
      </div>
    )
  }

  const closed = isAuctionClosed(auction)
  const latestBid = [...bids].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )[0]
  const winnerName = latestBid?.userName

  function handleOpenDialog() {
    setBidAmount('')
    setBidError(null)
    setIsDialogOpen(true)
  }

  async function handlePlaceBid() {
  const amount = Number(bidAmount)
  if (!amount || !auction) return

  setBidError(null)
  setIsBidding(true)

  try {
    const newBid = await placeBid.execute({ auctionId: auction.id, amount })

    setBids((prev) => {
      if (prev.some((b) => b.id === newBid.id)) return prev
      return [newBid, ...prev]
    })
    setAuction((prev) => (prev ? { ...prev, currentBid: newBid.amount } : prev))

    setIsDialogOpen(false)
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Erro ao registrar lance'
    setBidError(message)
  } finally {
    setIsBidding(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center">
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none', fontWeight: 600, color: '#1a3a6b' }}
          onClick={() => navigate('/auctions')}
        >
          Voltar
        </Button>
      </header>

      <main className="px-6 py-8 max-w-3xl mx-auto flex flex-col gap-6">
        <div
          className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all ${
            closed ? 'grayscale opacity-80' : ''
          }`}
        >
          <img
            src={auction.imageUrl}
            alt={auction.title}
            className="w-full h-64 object-cover"
          />

          <div className="p-6 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a3a6b' }}>
                {auction.title}
              </Typography>

              <Chip
                label={closed ? 'Encerrado' : 'Aberto'}
                color={closed ? 'default' : 'success'}
              />
            </div>

            <Chip
              label={auction.category}
              size="small"
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            />

            <Typography variant="body1" color="text.secondary">
              {auction.description}
            </Typography>

            <Divider className="my-2" />

            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" color="text.secondary">
                  {closed ? 'Lance vencedor' : 'Lance atual'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatCurrency(auction.currentBid)}
                </Typography>

                {closed ? (
                  winnerName && (
                    <Typography variant="caption" color="text.secondary">
                      Vencedor: {winnerName}
                    </Typography>
                  )
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    {bids.length} lance(s) · encerra em {formatEndsAt(auction.endsAt)}
                  </Typography>
                )}
              </div>

              <Button
                variant="contained"
                size="large"
                sx={{ textTransform: 'none', fontWeight: 600 }}
                disabled={closed}
                onClick={handleOpenDialog}
              >
                {closed ? 'Encerrado' : 'Dar lance'}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1a3a6b' }}>
            Lances
          </Typography>

          <BidList bids={bids} />
        </div>
      </main>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: '#1a3a6b' }}>
          Dar lance
        </DialogTitle>

        <DialogContent className="flex flex-col gap-2 pt-2">
          {bidError && <Alert severity="error">{bidError}</Alert>}

          <Typography variant="body2" color="text.secondary">
            Lance atual: {formatCurrency(auction.currentBid)}
          </Typography>

          <TextField
            label="Seu lance (R$)"
            type="number"
            fullWidth
            autoFocus
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsDialogOpen(false)} sx={{ textTransform: 'none' }} disabled={isBidding}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            sx={{ textTransform: 'none' }}
            onClick={handlePlaceBid}
            disabled={isBidding}
          >
            {isBidding ? 'Enviando...' : 'Confirmar lance'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default AuctionDetails