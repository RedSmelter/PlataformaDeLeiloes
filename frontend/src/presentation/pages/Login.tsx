import {
  Button,
  Divider,
  TextField,
  Typography,
} from '@mui/material'

import { Link } from 'react-router-dom'
import logo from '../../assets/LOGO.jpeg'

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4">
            <img
            
              src={logo}
              alt="Plataforma de Leilões"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Título */}
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
              Bem-vindo
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Entre na sua conta para acessar a plataforma de leilões.
            </Typography>
          </div>

          {/* Formulário */}
          <div className="flex flex-col gap-4">

            {/* E-mail */}
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              autoComplete="email"
            />

            {/* Senha */}
            <div>
              <TextField
                label="Senha"
                type="password"
                fullWidth
                autoComplete="current-password"
              />

              {/* Esqueci minha senha */}
              <div className="flex justify-end mt-2">
                <Link
                  to="#"
                  className="text-sm"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            {/* Login */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
              onClick={() => {
                console.log('Login')
              }}
            >
              Entrar
            </Button>

            {/* Separador */}
            <div className="flex items-center gap-4 my-2">
              <Divider className="flex-1" />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                ou
              </Typography>

              <Divider className="flex-1" />
            </div>

            {/* Google */}
            <Button
              variant="outlined"
              size="large"
              fullWidth
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              }}
              onClick={() => {
                console.log('Login com Google')
              }}
            >
              <span className="mr-3 font-bold text-lg">
                G
              </span>

              Continuar com Google
            </Button>

          </div>

          {/* Registro */}
          <div className="text-center mt-8">
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Ainda não possui uma conta?{' '}

              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
              >
                Criar conta
              </Link>
            </Typography>
          </div>

        </div>

        {/* Rodapé */}
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

export default Login