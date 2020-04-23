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

notesRouter
    .route('/')
    .get((req, res, next) => {
        const db = req.app.get('db')
        NotesService.getAllNotes(db)
            .then(notes => {
                res.json(notes)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const db = req.app.get('db')
        const { note_name, note_content, folder_id, date_mod } = req.body
        const newNote = { note_name, note_content, folder_id, date_mod }
        NotesService.insertNote(db, newNote)
            .then(note => {
                res
                    .status(201)
                    .location(`/api/notes/${note.id}`)
                    .json(note)
            })
        .catch(next)
    })


notesRouter
    .route('/:id')
    .get((req, res, next) => {
        const db = req.app.get('db')
        NotesService.getById(db, req.params.id)
            .then(notes => {
                if(!notes) {
                    return res.status(404).json({
                        error: { message: `Note does not exist`}
                    })
                }
                res.json(notes)
            })
            .catch(next)
    })



module.exports = notesRouter