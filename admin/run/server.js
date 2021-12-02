// Imports
const express = require('express')
const serveStatic = require('serve-static')

// Port
const port = process.env.PORT || 8080

// Express Server
const app = express()
// eslint-disable-next-line node/no-path-concat
app.use(serveStatic(__dirname + '/../dist'))
app.listen(port)

// eslint-disable-next-line no-console
console.log(`http://admin:${port} server started.`)