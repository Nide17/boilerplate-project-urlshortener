require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')

// Basic Configuration
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.use('/public', express.static(`${process.cwd()}/public`))

// connect to the database
mongoose.connect('mongodb+srv://parmenide:jesus123@fccmongoose.srblnut.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })

// create a schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
})

// create a model
const Url = mongoose.model('Url', urlSchema)

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' })
})

// url shortener
app.post('/api/shorturl', function (req, res) {

  let short_url = req.body.short_url
  // if the url is empty, return an error, generate a random number for the short url
  if (!short_url) {
    // generate a random number for the short url
    short_url = Math.floor(Math.random() * 1000)
  }

  // if the url is empty, return an error
  if (!req.body.url) {
    return res.json({ error: "invalid url!" })
  }

  // check if the url is valid using URL constructor
  try {
    const myUrl = new URL(req.body.url)

    // check if the url has a valid host name
    if(!myUrl.hostname) {
      return res.json({ error: "invalid url!" })
    }

    // check the protocol
    if(myUrl.protocol !== 'http:' && myUrl.protocol !== 'https:') {
      return res.json({ error: "invalid url!" })
    }

    // if the url is valid save it to database
    const url = new Url({
      original_url: req.body.url,
      short_url: short_url
    })

    // save the url to the database
    url.save(function (err, data) {
      if (err) return console.error(err)
      res.json(data)
    })
    
  }
  catch (err) {
    return res.json({ error: "invalid url!" })
  }
  
})

app.get('/api/shorturl/:short_url', function (req, res) {
  const short_url = req.params.short_url

  // get the original url from the database
  Url.findOne({ short_url: short_url }, function (err, data) {
    if (err) return console.error(err)

    // if the short url does not exist, return an error
    if (!data) {
      return res.json({ error: "invalid url" })
    }
    // else redirect to the original url
    else {
      data.original_url && res.redirect(301, data.original_url)
    }
  })

})

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})
