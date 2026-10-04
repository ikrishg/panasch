import { createLogger, runWithContext } from '../dist/index.js'
import { logGenAiChat } from '../dist/ai/index.js'

const output = document.querySelector('#output')
const formatSelect = document.querySelector('#format')
const dedupCheck = document.querySelector('#dedup')

const lines = []

function render () {
  output.textContent = lines.join('\n')
}

function makeLogger () {
  return createLogger({
    format: formatSelect.value,
    dedup: dedupCheck.checked,
    sink: (line) => {
      lines.push(line)
      render()
    }
  })
}

document.querySelector('#btn-clear').addEventListener('click', () => {
  lines.length = 0
  render()
})

document.querySelector('#btn-info').addEventListener('click', () => {
  const log = makeLogger()
  runWithContext({ requestId: 'playground' }, () => {
    log.info({ userId: 'demo' }, 'hello from the browser')
  })
})

document.querySelector('#btn-genai').addEventListener('click', () => {
  const log = makeLogger()
  logGenAiChat(log, {
    model: 'gpt-4',
    inputTokens: 42,
    outputTokens: 12,
    prompt: 'secret prompt text'
  })
})

document.querySelector('#btn-dup').addEventListener('click', () => {
  const log = makeLogger()
  for (let i = 0; i < 3; i++) {
    log.info('duplicate line for dedup demo')
  }
})
