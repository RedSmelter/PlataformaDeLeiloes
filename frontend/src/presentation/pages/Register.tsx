import { useState } from 'react'
import {
  Button,
  Divider,
  TextField,
  Typography,
  Alert,
} from '@mui/material'

import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/LOGO.jpeg'
import { Register as RegisterUseCase } from '../../application/use-cases/auth/Register'
import { Login as LoginUseCase } from '../../application/use-cases/auth/Login'
import { HttpUserRepository } from '../../infrastructure/repositories/HttpUserRepository'
import { ApiError } from '../../infrastructure/http/api'

const userRepository = new HttpUserRepository()
const registerUseCase = new RegisterUseCase(userRepository)
const loginUseCase = new LoginUseCase(userRepository)

function Register() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleRegister() {
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setIsLoading(true)

    try {
      await registerUseCase.execute({ username, email, password })

      // Registro não devolve token — loga em seguida com as mesmas credenciais
      // para já entrar autenticado, sem exigir um segundo formulário.
      const result = await loginUseCase.execute({ email, password })
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))

      navigate('/auctions')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar conta'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-lg p-8">

          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4">
            <img
              src={logo}
              alt="Plataforma de Leilões"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center mb-8">
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: '#1a3a6b',
                fontWeight: 700,
              }}
              gutterBottom
            >
              Criar conta
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Crie sua conta para participar dos leilões.
            </Typography>
          </div>

          <div className="flex flex-col gap-4">

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Nome de usuário"
              placeholder="Ex.: joaosilva"
              fullWidth
              helperText="Esse nome aparecerá nos seus lances."
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              label="E-mail"
              type="email"
              fullWidth
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Senha"
              type="password"
              fullWidth
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
              label="Confirmar senha"
              type="password"
              fullWidth
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={isLoading}
              onClick={handleRegister}
              sx={{
                py: 1.5,
                mt: 1,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>

            <div className="flex items-center gap-4 my-2">
              <Divider className="flex-1" />
              <Typography variant="body2" color="text.secondary">
                ou
              </Typography>
              <Divider className="flex-1" />
            </div>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => {
                console.log('Cadastro com Google')
              }}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              <span className="mr-3 font-bold text-lg">
                G
              </span>
              Continuar com Google
            </Button>

          </div>

          <div className="text-center mt-8">
            <Typography variant="body2" color="text.secondary">
              Já possui uma conta?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
              >
                Entrar
              </Link>
            </Typography>
          </div>

        </div>

        <Typography
          variant="caption"
          color="text.secondary"
          className="block text-center mt-6"
        >
          © 2026 Plataforma de Leilões
        </Typography>

      </div>
    </div>
  )
}

export default Register