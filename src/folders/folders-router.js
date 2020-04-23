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
    .post(jsonParser, (req, res, next) => {
        const { folder_name } = req.body
        const newFolder = { folder_name }
        const db = req.app.get('db')
        FoldersService.insertFolder(db, newFolder)
            .then(folder => {
                res
                    .status(201)
                    .location(`/api/folders/${folder.id}`)
                    .json(folder)
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