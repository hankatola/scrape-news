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

// controllers
const scrapeArticles = (req,res) => {
  axios.get("https://www.nytimes.com/section/us").then(response => {
    const $ = cheerio.load(response.data)
    const articles = []
    $("li.css-ye6x8s").each((i, x) => {
      const result = {}
      result.title = $(x).find('h2').text()
      result.link = "https://www.nytimes.com" + $(x).find('a').attr("href")
      result.body = $(x).find("p").text()
      articles.push(result)
    //   db.Article.create(result).then(articles => {
    //     res.json(articles)
    //   })
    // })
      db.Article.findOne({ link: result.link }).then(a => {
        if (!a) {
          db.Article.create(result).then(dbArticle => {
          }).catch(err => {
            console.log(err)
          });
        } else {
        }
      })
    })
    db.Article.find({}).sort({_id:-1}).then(dbArticles => {
      res.json(dbArticles)
    }).catch(err => {
      console.log(err)
    })
  })
}
const saveArticle = (req, res) => {
  const id = req.params.id
  db.Article.find({
    _id: id
  }).then(article => {
    db.Article.update(
      {
        _id: id
      },
      {
        $set: {
        saved: !article[0].saved
        }
      }
    ).then(updated => {
      res.status(200)
    })
  }).catch(err => {
    console.log(err)
  })
}
const getAllArticles = (req, res) => {
  db.Article.find({}).sort({_id:-1}).then(articles => {
    res.json(articles)
  }).catch(err => {
    res.json(err)
  })
}
const getSavedArticles = (req, res) => {
  db.Article.find({saved: true}).sort({_id:-1})
  .then(articles => {
    res.json(articles)
  })
  .catch(err => {
    res.json(err)
  })
}
const getNote = (req, res) => {
  db.Note.find(
    { articleId: req.params.id }
  ).sort({_id:-1}).then(notes => {
    console.log(notes)
    res.json(notes)
  })
}
const makeNote = (req, res) => {
  db.Note.create({
    articleId: req.params.id,
    body: req.body.body
  }).then(note => {
    res.json(note)
  })
}
const deleteNote = (req, res) => {
  db.Note.remove(
    { _id: req.params.id }
  ).then(z => {
    res.status(200)
  })
}
// Routes
const router = require('express').Router()
app.use(router)
router.get("/articles", getAllArticles)
router.get("/scrape", scrapeArticles)
router.get("/savedArticles", getSavedArticles)
router.post("/saveArticle/:id", saveArticle)
router.get("/note/:id", getNote)
router.post("/note/:id", makeNote)
router.post("/deleteNote/:id", deleteNote)


// Start the server
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`)
});
