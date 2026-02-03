const http = require('http')
const fs = require('fs')
const path = require('path')

const DASHBOARD_PATH = path.join(__dirname, '../../dashboard/index.html')

function startWebServer() {
  const port = parseInt(process.env.PORT || '3000', 10)

  const server = http.createServer((req, res) => {
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

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(html)
    })
  })

  server.listen(port, () => {
    console.log(`🌐 Dashboard web server running on port ${port}`)
  })

  return server
}

module.exports = { startWebServer }
