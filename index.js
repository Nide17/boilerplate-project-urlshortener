require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// connect to the database
mongoose.connect('mongodb+srv://parmenide:jesus123@fccmongoose.srblnut.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

// create a schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

// create a model
const Url = mongoose.model('Url', urlSchema);

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// Create an array to hold url and short
let urlArray = [];

// url shortener
app.post('/api/shorturl', function (req, res) {

  let short_url = req.body.short_url;
  // if the url is empty, return an error, generate a random number for the short url
  if (!short_url) {
    // generate a random number for the short url
    short_url = Math.floor(Math.random() * 1000);
  }

  // if the url is empty, return an error
  if (!req.body.url) {
    return res.json({ error: "invalid url!" });
  }

  // check if the url is valid with http:// or https:// and www.
  try {
    new URL(req.body.url);
  } catch (err) {
    return res.json({ error: "invalid url" });
  }
  
  // extract the url from the host name and remove the http:// or https:// and www. and the last slash if it exists
  const host = req.body.url.replace(/(^\w+:|^)\/\//, '').replace(/www./, '').replace(/\/$/, '');
  
  // perform a dns lookup on the host name
  dns.lookup(host, (err, address, family) => {

    if (err) {
      return res.json({ error: "invalid url" });
    }

    else {
      // // save the url to the database
      // const newUrl = new Url({ original_url: req.body.url.replace(/\/$/, ''), short_url });

      // newUrl.save(function (err, data) {
      //   if (err) return console.error(err);

      //   // return the original url and the short url
      //   res.json({ original_url: data.original_url, short_url });
      // });

      // Push the url and short as an object to the array if the url isn't already in the array 
      if (urlArray.indexOf(req.body.url) === -1) {
        urlArray.push({ original_url: req.body.url, short_url });
      }

      console.log(urlArray);

      // return the last saved url
      res.json(urlArray[urlArray.length - 1]);
    }
  });
})

app.get('/api/shorturl/:short_url', function (req, res) {
  const short_url = req.params.short_url;

  // get the original url from the database
  // Url.findOne({ short_url: short_url }, function (err, data) {
  //   if (err) return console.error(err);

  //   // if the short url does not exist, return an error
  //   if (!data) {
  //     return res.json({ error: "invalid url" });
  //   }
  //   // else redirect to the original url
  //   else {
  //     data.original_url && res.redirect(301, data.original_url);
  //   }
  // });

  // get the original url from the array
  const url = urlArray.find(url => url.short_url == short_url);

  // if the short url does not exist, return an error
  if (!url) {
    return res.json({ error: "invalid url" });
  }

  // else redirect to the original url
  else {
    url.original_url && res.redirect(url.original_url);
  }

});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
