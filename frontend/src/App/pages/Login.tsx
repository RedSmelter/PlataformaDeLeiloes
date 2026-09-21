import {
  Button,
  Divider,
  Link,
  TextField,
  Typography,
} from '@mui/material'

interface LoginProps {
  onLogin: () => void
  onRegister: () => void
}

function Login({ onLogin, onRegister }: LoginProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">
                LOGO
              </span>
            </div>
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <Typography
              variant="h4"
              component="h1"
              sx={{
                  fontWeight: 700
                }}
              gutterBottom
            >
              Bem-vindo
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Entre na sua conta para acessar a plataforma de leilões.
            </Typography>
          </div>

          {/* Formulário */}
          <div className="flex flex-col gap-4">

            <TextField
              label="E-mail"
              type="email"
              fullWidth
              autoComplete="email"
            />

            <div>
              <TextField
                label="Senha"
                type="password"
                fullWidth
                autoComplete="current-password"
              />

              <div className="flex justify-end mt-2">
                <Link
                  href="#"
                  underline="hover"
                  variant="body2"
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
              onClick={onLogin}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
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
                component={Button}
                underline="hover"
                onClick={onRegister}
                sx={{
                    fontWeight: 600,
                    cursor: 'pointer',
                    }}
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