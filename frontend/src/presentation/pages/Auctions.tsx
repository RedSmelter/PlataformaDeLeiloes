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
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import logo from '../../assets/LOGO.jpeg'
import AuctionCard from '../components/AuctionCard'
import { initialAuctions } from '../mocks/mocksAuctions'
import { AUCTION_CATEGORIES } from '../../domain/entities/Auction'
import type { Auction, AuctionCategory } from '../../domain/entities/Auction'

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
  const [auctions, setAuctions] = useState<Auction[]>(initialAuctions)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState<NewAuctionForm>(emptyForm)

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Todas')

  const [auctionToDelete, setAuctionToDelete] = useState<Auction | null>(null)

  // Força reavaliação periódica de isAuctionClosed() sem precisar recarregar a página,
  // para que um leilão vire "encerrado" sozinho quando o prazo passa com a tela aberta.
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
    setIsDialogOpen(true)
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
  }

  function handleFormChange(field: keyof NewAuctionForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleCreateAuction() {
    if (!form.title || !form.startingPrice || !form.endsAt) {
      return
    }

    const newAuction: Auction = {
      id: crypto.randomUUID(),
      title: form.title,
      description: form.description,
      imageUrl: 'https://placehold.co/600x400?text=Leilao',
      category: form.category,
      currentBid: Number(form.startingPrice),
      bidsCount: 0,
      endsAt: new Date(form.endsAt),
      status: 'open',
    }

    setAuctions((prev) => [newAuction, ...prev])
    setIsDialogOpen(false)
  }

  function handleRequestDelete(auction: Auction) {
    setAuctionToDelete(auction)
  }

  function handleCancelDelete() {
    setAuctionToDelete(null)
  }

  function handleConfirmDelete() {
    if (!auctionToDelete) return
    setAuctions((prev) => prev.filter((a) => a.id !== auctionToDelete.id))
    setAuctionToDelete(null)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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

      {/* Conteúdo */}
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

        {filteredAuctions.length === 0 ? (
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

      {/* Modal de criação */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, color: '#1a3a6b' }}>
          Criar novo leilão
        </DialogTitle>

        <DialogContent className="flex flex-col gap-4 pt-2">
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
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            sx={{ textTransform: 'none' }}
            onClick={handleCreateAuction}
          >
            Criar leilão
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={!!auctionToDelete} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#b91c1c' }}>
          Excluir leilão
        </DialogTitle>

        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o leilão "{auctionToDelete?.title}"? Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelDelete} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ textTransform: 'none' }}
            onClick={handleConfirmDelete}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Auctions