/**
 * Sirve dist/ bajo /game-learning para E2E en CI (imita GitHub Pages).
 * `astro preview` sirve en raíz e ignora `base`; este script no.
 * Sin dependencias: solo node:http + node:fs.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = 4321
const BASE = '/game-learning'
const DIST = new URL('../dist/', import.meta.url)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
}

function resolveFile(urlPath) {
  const rel = decodeURIComponent(urlPath.slice(BASE.length).replace(/^\//, ''))
  const direct = new URL(rel || 'index.html', DIST)
  const p = path.normalize(fileURLToPath(direct))
  const distDir = path.normalize(fileURLToPath(DIST))
  if (!p.startsWith(distDir)) return null
  try {
    const stat = fs.statSync(p)
    if (stat.isDirectory()) {
      const index = path.join(p, 'index.html')
      return fs.existsSync(index) ? index : null
    }
    return p
  } catch {
    const nested = path.join(p, 'index.html')
    try {
      return fs.statSync(nested).isFile() ? nested : null
    } catch {
      return null
    }
  }
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url ?? '/').split('?')[0]
  if (!urlPath.startsWith(BASE)) {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('Not found (serve-pages solo sirve /game-learning)')
    return
  }
  const file = resolveFile(urlPath === BASE ? `${BASE}/` : urlPath)
  if (!file) {
    try {
      const notFound = path.join(fileURLToPath(DIST), '404.html')
      const body = fs.readFileSync(notFound)
      res.writeHead(404, { 'content-type': MIME['.html'] })
      res.end(body)
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('Not found')
    }
    return
  }
  const ext = path.extname(file)
  res.writeHead(200, { 'content-type': MIME[ext] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})

server.listen(PORT, () => {
  console.log(`serve-pages: http://localhost:${PORT}${BASE}/`);
})
