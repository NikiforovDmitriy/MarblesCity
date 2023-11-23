require('./dist/server/bundle.js')

const express = require('express')
const app = express()
const port = 8080

app.get('/', (req, res) => res.redirect('./index.html'))

app.use(express.static('./dist/client'))

app.listen(port, () => console.log(`App listening at port: ${port}`))
