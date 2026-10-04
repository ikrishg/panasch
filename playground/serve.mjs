#!/usr/bin/env node
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const port = Number(process.env.PLAYGROUND_PORT ?? 4173)

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
}

createServer((req, res) => {
  const url = req.url === '/' ? '/playground/index.html' : req.url ?? '/'
  const filePath = join(root, url.replace(/^\//, ''))
  if (!filePath.startsWith(root) || !existsSync(filePath)) {
    res.writeHead(404)
    res.end('Not found')
    return
  }
  const ext = extname(filePath)
  res.writeHead(200, { 'Content-Type': types[ext] ?? 'application/octet-stream' })
  res.end(readFileSync(filePath))
}).listen(port, () => {
  console.log(`Panasch playground: http://localhost:${port}/playground/`)
})
