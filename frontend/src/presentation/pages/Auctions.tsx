import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import logo from '../../assets/LOGO.jpeg'
import AuctionCard from '../components/AuctionCard'
import { GetAuctions } from '../../application/use-cases/auction/GetAuctions'
import { CreateAuction } from '../../application/use-cases/auction/CreateAuction'
import { DeleteAuction } from '../../application/use-cases/auction/DeleteAuction'
import { HttpAuctionRepository } from '../../infrastructure/repositories/HttpAuctionRepository'
import { ApiError } from '../../infrastructure/http/api'
import { AUCTION_CATEGORIES } from '../../domain/entities/Auction'
import type { Auction, AuctionCategory } from '../../domain/entities/Auction'

const auctionRepository = new HttpAuctionRepository()
const getAuctions = new GetAuctions(auctionRepository)
const createAuction = new CreateAuction(auctionRepository)
const deleteAuction = new DeleteAuction(auctionRepository)

interface NewAuctionForm {
  title: string
  description: string
  category: AuctionCategory
  startingPrice: string
  endsAt: string
}

const emptyForm: NewAuctionForm = {
  title: '',
  description: '',
  category: AUCTION_CATEGORIES[0],
  startingPrice: '',
  endsAt: '',
}

type CategoryFilter = AuctionCategory | 'Todas'

function Auctions() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState<NewAuctionForm>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Todas')

  const [auctionToDelete, setAuctionToDelete] = useState<Auction | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function loadAuctions() {
      try {
        const result = await getAuctions.execute()
        setAuctions(result)
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Erro ao carregar leilões'
        setLoadError(message)
      } finally {
        setIsLoadingAuctions(false)
      }
    }

    loadAuctions()
  }, [])

  const [, forceRerender] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => forceRerender((n) => n + 1), 15000)
    return () => clearInterval(interval)
  }, [])

  const filteredAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      const matchesSearch = auction.title
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())

      const matchesCategory =
        categoryFilter === 'Todas' || auction.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [auctions, searchTerm, categoryFilter])

  function handleOpenDialog() {
    setForm(emptyForm)
    setFormError(null)
    setIsDialogOpen(true)
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
  }

  function handleFormChange(field: keyof NewAuctionForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleCreateAuction() {
    if (!form.title || !form.startingPrice || !form.endsAt) {
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    try {
      const newAuction = await createAuction.execute({
        title: form.title,
        description: form.description,
        category: form.category,
        startingPrice: Number(form.startingPrice),
        endsAt: new Date(form.endsAt),
      })

      setAuctions((prev) => [newAuction, ...prev])
      setIsDialogOpen(false)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar leilão'
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleRequestDelete(auction: Auction) {
    setDeleteError(null)
    setAuctionToDelete(auction)
  }

  function handleCancelDelete() {
    setAuctionToDelete(null)
  }

  async function handleConfirmDelete() {
    if (!auctionToDelete) return

    setDeleteError(null)
    setIsDeleting(true)

    try {
      await deleteAuction.execute(auctionToDelete.id)
      setAuctions((prev) => prev.filter((a) => a.id !== auctionToDelete.id))
      setAuctionToDelete(null)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir leilão'
      setDeleteError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Plataforma de Leilões" className="w-10 h-10 rounded-lg object-cover" />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a3a6b' }}>
            Plataforma de Leilões
          </Typography>
        </div>

        <Button
          variant="contained"
          sx={{ textTransform: 'none', fontWeight: 600 }}
          onClick={handleOpenDialog}
        >
          Criar leilão
        </Button>
      </header>

      <main className="px-6 py-8 max-w-6xl mx-auto">
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#1a3a6b' }}>
          Leilões disponíveis
        </Typography>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <TextField
            placeholder="Pesquisar leilões..."
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="Todas">Todas as categorias</MenuItem>
            {AUCTION_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </div>

        {isLoadingAuctions ? (
          <div className="flex justify-center py-12">
            <CircularProgress />
          </div>
        ) : loadError ? (
          <Alert severity="error">{loadError}</Alert>
        ) : filteredAuctions.length === 0 ? (
          <Typography color="text.secondary">
            Nenhum leilão encontrado com esses filtros.
          </Typography>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onRequestDelete={handleRequestDelete}
              />
            ))}
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, color: '#1a3a6b' }}>
          Criar novo leilão
        </DialogTitle>

        <DialogContent className="flex flex-col gap-4 pt-2">
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="Título"
            fullWidth
            value={form.title}
            onChange={(e) => handleFormChange('title', e.target.value)}
          />

          <TextField
            label="Descrição"
            fullWidth
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
          />

          <Select
            value={form.category}
            onChange={(e) => handleFormChange('category', e.target.value)}
            fullWidth
          >
            {AUCTION_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>

          <Button
            component="label"
            variant="outlined"
            sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
          >
            Adicionar foto (opcional)
            <input type="file" accept="image/*" hidden />
          </Button>

          <TextField
            label="Preço inicial (R$)"
            type="number"
            fullWidth
            value={form.startingPrice}
            onChange={(e) => handleFormChange('startingPrice', e.target.value)}
          />

          <TextField
            label="Data/hora de encerramento"
            type="datetime-local"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={form.endsAt}
            onChange={(e) => handleFormChange('endsAt', e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            sx={{ textTransform: 'none' }}
            onClick={handleCreateAuction}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Criando...' : 'Criar leilão'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!auctionToDelete} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#b91c1c' }}>
          Excluir leilão
        </DialogTitle>

        <DialogContent className="flex flex-col gap-3">
          {deleteError && <Alert severity="error">{deleteError}</Alert>}

          <Typography>
            Tem certeza que deseja excluir o leilão "{auctionToDelete?.title}"? Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelDelete} sx={{ textTransform: 'none' }} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ textTransform: 'none' }}
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Auctions