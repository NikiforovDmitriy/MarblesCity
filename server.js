require('./dist/server/bundle.js')
const cors = require('cors')
const express = require('express')
const app = express()
const port = 8080

app.use(cors())

app.use(express.static('./dist/client'))

app.get('/', (req, res) => res.redirect('./index.html'))

app.listen(port, () => console.log(`App listening at port: ${port}`))
