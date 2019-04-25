const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  body: {
    type: String,
    required: false
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  },
  saved: {
    type: Boolean,
    default: false
  }
});

const Article = mongoose.model("Article", ArticleSchema)

module.exports = Article
