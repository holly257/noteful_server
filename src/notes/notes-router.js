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
                res.json({
                    id: notes.id,
                    note_name: notes.note_name,
                    note_content: notes.note_content,
                    folder_id: notes.folder_id,
                    date_mod: new Date(notes.date_mod),
                })
            })
            .catch(next)
    })



module.exports = notesRouter