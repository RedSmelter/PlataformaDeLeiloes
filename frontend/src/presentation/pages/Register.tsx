import {
  Button,
  Divider,
  TextField,
  Typography,
} from '@mui/material'

import { Link } from 'react-router-dom'
import logo from '../../assets/LOGO.jpeg'

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
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
              Criar conta
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Crie sua conta para participar dos leilões.
            </Typography>
          </div>

          {/* Formulário */}
          <div className="flex flex-col gap-4">

            {/* Nome de usuário */}
            <TextField
              label="Nome de usuário"
              placeholder="Ex.: joaosilva"
              fullWidth
              helperText="Esse nome aparecerá nos seus lances."
              autoComplete="username"
            />

            {/* E-mail */}
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              autoComplete="email"
            />

            {/* Senha */}
            <TextField
              label="Senha"
              type="password"
              fullWidth
              autoComplete="new-password"
            />

            {/* Confirmar senha */}
            <TextField
              label="Confirmar senha"
              type="password"
              fullWidth
              autoComplete="new-password"
            />

            {/* Criar conta */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => {
                console.log('Cadastro enviado')
              }}
              sx={{
                py: 1.5,
                mt: 1,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Criar conta
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

          {/* Voltar para login */}
          <div className="text-center mt-8">
            <Typography
              variant="body2"
              color="text.secondary"
            >
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

export default Register