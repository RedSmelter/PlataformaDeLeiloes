const API_URL = process.env.API_URL ?? 'http://localhost:3000'

export type TestUser = {
  username: string
  email: string
  password: string
  token: string
}

export async function createTestUser(
  name: string,
): Promise<TestUser> {
  const timestamp = Date.now()

  const user = {
    username: `${name}-${timestamp}`,
    email: `${name}-${timestamp}@example.com`,
    password: 'Test123456!',
  }

  console.log(`[...] Criando ${name}...`)

  // -----------------------------
  // Registro
  // -----------------------------

  const registerResponse = await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    },
  )

  const registerData = await registerResponse.json()

  if (!registerResponse.ok) {
    throw new Error(
      `Falha ao criar ${name}: ${JSON.stringify(registerData)}`,
    )
  }

  console.log(`[✓] ${name} criado`)

  // -----------------------------
  // Login
  // -----------------------------

  const loginResponse = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
    },
  )

  const loginData = await loginResponse.json()

  if (!loginResponse.ok) {
    throw new Error(
      `Falha ao fazer login de ${name}: ${JSON.stringify(loginData)}`,
    )
  }

  if (!loginData.token) {
    throw new Error(
      `Token não encontrado para ${name}: ${JSON.stringify(loginData)}`,
    )
  }

  console.log(`[✓] Login de ${name} realizado`)
  console.log(`[✓] JWT de ${name} obtido`)

  return {
    ...user,
    token: loginData.token,
  }
}