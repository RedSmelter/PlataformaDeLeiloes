import { execSync } from 'child_process'

const MIN_REPLICAS = Number(process.env.MIN_REPLICAS ?? 2)
const MAX_REPLICAS = Number(process.env.MAX_REPLICAS ?? 3)
const SCALE_UP_THRESHOLD = Number(process.env.SCALE_UP_THRESHOLD ?? 90)
const SCALE_DOWN_THRESHOLD = Number(process.env.SCALE_DOWN_THRESHOLD ?? 30)
const CHECK_INTERVAL_MS = Number(process.env.CHECK_INTERVAL_SECONDS ?? 10) * 1000
const CONSECUTIVE_READINGS_REQUIRED = 2
const PROJECT_NAME = process.env.COMPOSE_PROJECT_NAME ?? 'auction-platform'

let currentReplicas = MIN_REPLICAS
let aboveThresholdCount = 0
let belowThresholdCount = 0

function getBackendContainerIds() {
  const output = execSync(
    `docker ps --filter "label=com.docker.compose.project=${PROJECT_NAME}" --filter "label=com.docker.compose.service=backend" --format "{{.ID}}"`
  ).toString().trim()

  return output ? output.split('\n') : []
}

function getAverageCpuPercent(containerIds) {
  if (containerIds.length === 0) return 0

  const idsArg = containerIds.join(' ')
  const output = execSync(`docker stats --no-stream --format "{{.CPUPerc}}" ${idsArg}`).toString().trim()

  const values = output
    .split('\n')
    .map((line) => parseFloat(line.replace('%', '')))
    .filter((n) => !Number.isNaN(n))

  if (values.length === 0) return 0

  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function scaleTo(replicas) {
  console.log(`[autoscaler] Escalando backend para ${replicas} instância(s)...`)
  execSync(
    `docker compose -p ${PROJECT_NAME} up -d --scale backend=${replicas} --no-recreate`,
    { stdio: 'inherit', cwd: '/workspace' }
  )
  currentReplicas = replicas
  aboveThresholdCount = 0
  belowThresholdCount = 0
}

function tick() {
  const containerIds = getBackendContainerIds()

  if (containerIds.length === 0) {
    console.warn('[autoscaler] Nenhum container do backend encontrado ainda.')
    return
  }

  const avgCpu = getAverageCpuPercent(containerIds)
  console.log(`[autoscaler] Instâncias: ${containerIds.length} | CPU média: ${avgCpu.toFixed(1)}%`)

  if (avgCpu >= SCALE_UP_THRESHOLD && currentReplicas < MAX_REPLICAS) {
    aboveThresholdCount++
    belowThresholdCount = 0
    console.log(`[autoscaler] Acima do limite (${aboveThresholdCount}/${CONSECUTIVE_READINGS_REQUIRED})`)

    if (aboveThresholdCount >= CONSECUTIVE_READINGS_REQUIRED) {
      scaleTo(currentReplicas + 1)
    }
  } else if (avgCpu <= SCALE_DOWN_THRESHOLD && currentReplicas > MIN_REPLICAS) {
    belowThresholdCount++
    aboveThresholdCount = 0
    console.log(`[autoscaler] Abaixo do limite (${belowThresholdCount}/${CONSECUTIVE_READINGS_REQUIRED})`)

    if (belowThresholdCount >= CONSECUTIVE_READINGS_REQUIRED) {
      scaleTo(currentReplicas - 1)
    }
  } else {
    aboveThresholdCount = 0
    belowThresholdCount = 0
  }
}

console.log(
  `[autoscaler] Iniciado. min=${MIN_REPLICAS} max=${MAX_REPLICAS} scale-up=${SCALE_UP_THRESHOLD}% scale-down=${SCALE_DOWN_THRESHOLD}%`
)

scaleTo(MIN_REPLICAS) // garante a baseline ao iniciar

setInterval(tick, CHECK_INTERVAL_MS)