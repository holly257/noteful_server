const path = require('path')
const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')
const foldersRouter = express.Router()
const jsonParser = express.json()

const sanitizeFolders = folders => ({
    folder_name: xss(folders.folder_name),
})

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const db = req.app.get('db')
        FoldersService.getAllFolders(db)
            .then(folders => {
                res.json(folders)
            })
            .catch(next)
    })

foldersRouter
    .route('/:id')
    .get((req, res, next) => {
        const db = req.app.get('db')
        FoldersService.getById(db, req.params.id)
            .then(folders => {
                if(!folders) {
                    return res.status(404).json({
                        error: { message: `Folder does not exist`}
                    })
                }
                res.json(folders)
            })
            .catch(next)
    })

module.exports = foldersRouter