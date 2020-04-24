const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')
const notesRouter = express.Router()
const jsonParser = express.json()

const sanitizeNotes = notes => ({
    id: notes.id,
    note_name: xss(notes.note_name),
    note_content: xss(notes.note_content),
    folder_id: notes.folder_id,
    date_mod: notes.date_mod
})

notesRouter
    .route('/')
    .get((req, res, next) => {
        const db = req.app.get('db')
        NotesService.getAllNotes(db)
            .then(notes => {
                res.json(notes.map(sanitizeNotes))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const db = req.app.get('db')
        const { note_name, note_content, folder_id, date_mod } = req.body
        const newNote = { note_name, note_content, folder_id, date_mod }
        
        // if(!)
        
        NotesService.insertNote(db, newNote)
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(sanitizeNotes(note))
            })
        .catch(next)
    })


notesRouter
    .route('/:id')
    .all((req, res, next) => {
        const db = req.app.get('db')
        NotesService.getById(db, req.params.id)
            .then(notes => {
                if(!notes) {
                    return res.status(404).json({
                        error: { message: `Note does not exist`}
                    })
                }
                res.notes = notes
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(sanitizeNotes(res.notes))
    })
    .delete((req, res, next) => {
        const db = req.app.get('db')
        const id = req.params.id
        NotesService.deleteNote(db, id)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = notesRouter