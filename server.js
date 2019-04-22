const express = require("express")
const logger = require("morgan")
const mongoose = require("mongoose")
const axios = require("axios")
const cheerio = require("cheerio")
const db = require("./models")
const PORT = process.env.PORT || 8080
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines"

mongoose.connect(MONGODB_URI)

// Initialize Express
const app = express()

app.use(logger("dev"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static("public"))

mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true })

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", (req, res) => {
  axios.get("http://www.echojs.com/").then(response => {
    const $ = cheerio.load(response.data)
    $("article h2").each((i, element) => {
      const result = {}
      result.title = $(element).children("a").text()
      result.link = $(element).children("a").attr("href")
      db.Article.create(result)
        .then(dbArticle => {
          console.log(dbArticle)
        })
        .catch(err => {
          console.log(err)
        });
    });
    res.send("Scrape Complete")
  });
});

app.get("/articles", (req, res) => {
  db.Article.find({})
    .then(dbArticle => {
      res.json(dbArticle)
    })
    .catch(err => {
      res.json(err)
    });
});

app.get("/articles/:id", (req, res) => {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(dbArticle => {
      res.json(dbArticle)
    })
    .catch(err => {
      res.json(err)
    });
});

app.post("/articles/:id", (req, res) => {
  db.Note.create(req.body)
    .then(dbNote => {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true })
    })
    .then(dbArticle => {
      res.json(dbArticle)
    })
    .catch(err => {
      res.json(err)
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`)
});
