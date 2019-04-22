const mongoose = require("mongoose")

const Schema = mongoose.Schema

// Using the Schema constructor, create a new NoteSchema object
const NoteSchema = new Schema({
  title: String,
  body: String
});

const Note = mongoose.model("Note", NoteSchema)

module.exports = Note
