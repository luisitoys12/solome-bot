const http = require('http')
const fs = require('fs')
const path = require('path')

const DASHBOARD_PATH = path.join(__dirname, '../../dashboard/index.html')

function parsePort(rawPort) {
  const port = Number.parseInt(rawPort || '3000', 10)

  if (Number.isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: ${rawPort}`)
  }

  return port
}

function isAuthorized(req, accessToken) {
  if (!accessToken) {
    return true
  }

  const incomingToken = req.headers['x-dashboard-token']
  return incomingToken === accessToken
}

function startWebServer() {
  const port = parsePort(process.env.PORT)
  const host = process.env.HOST || '127.0.0.1'
  const accessToken = process.env.DASHBOARD_ACCESS_TOKEN

  const server = http.createServer((req, res) => {
    if (!isAuthorized(req, accessToken)) {
      res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Unauthorized')
      return
    }

    if (req.url && req.url !== '/' && req.url !== '/index.html') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Not Found')
      return
    }

    fs.readFile(DASHBOARD_PATH, 'utf8', (err, html) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('Error loading dashboard')
        return
      }

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      })
      res.end(html)
    })
  })

  server.listen(port, host, () => {
    const tokenStatus = accessToken ? 'enabled' : 'disabled'
    console.log(`🌐 Dashboard web server running on http://${host}:${port} (token ${tokenStatus})`)
  })

  return server
}

module.exports = { startWebServer }
