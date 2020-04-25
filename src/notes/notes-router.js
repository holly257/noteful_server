const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')
const notesRouter = express.Router()
const jsonParser = express.json()

const sanitizeNotes = notes => ({
    id: notes.id,
    name: xss(notes.name),
    content: xss(notes.content),
    folderId: notes.folder_id,
    modified: notes.modified
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
        const { name, content, folderId: folder_id, modified } = req.body
        const required = { name, content, folderId: req.body.folder_id}  
        const newNote = { name, content, folder_id: req.body.folder_id, modified }

        for(const [key, value] of Object.entries(required)) {
            console.log(value)
            if (value ==  null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body`}
                })
            }
        }
        
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
    .patch(jsonParser, (req, res, next) => {
        const db = req.app.get('db')
        const id = req.params.id
        const { name, content, folderId: folder_id, modified } = req.body
        const updatedNote = { name, content, folderId: folder_id, modified }

        const numberOfValues = Object.values(updatedNote).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: { message: 'Request body must contain name and content'}
            })
        }

        NotesService.updateNote(db, id, updatedNote)
            .then(rows => {
                res.status(204).end()
            })
        .catch(next)
    })


module.exports = notesRouter