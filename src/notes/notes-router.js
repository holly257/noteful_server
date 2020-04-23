const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')
const notesRouter = express.Router()
const jsonParser = express.json()

const sanitizeNotes = notes => ({
    note_name: xss(notes.note_name),
    note_content: xss(notes.note_content),
    folder_id: notes.folder_id,
})
