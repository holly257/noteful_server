const path = require('path')
const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')
const foldersRouter = express.Router()
const jsonParser = express.json()

const sanitizeFolders = folders => ({
    id: folders.id,
    name: xss(folders.name),
})

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const db = req.app.get('db')
        FoldersService.getAllFolders(db)
            .then(folders => {
                res.json(folders.map(sanitizeFolders))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name } = req.body
        const newFolder = { name }
        const db = req.app.get('db')

        if(!name) {
            return res.status(400).json({
                error: { message: `Folder name is required`}
            })
        }

        FoldersService.insertFolder(db, newFolder)
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(sanitizeFolders(folder))
            })
        .catch(next)
    })

foldersRouter
    .route('/:id')
    .all((req, res, next) => {
        const db = req.app.get('db')
        FoldersService.getById(db, req.params.id)
            .then(folders => {
                if(!folders) {
                    return res.status(404).json({
                        error: { message: `Folder does not exist`}
                    })
                }
                res.folders = folders
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(sanitizeFolders(res.folders))
    })
    .patch(jsonParser, (req, res, next) => {
        const db = req.app.get('db')
        const id = req.params.id
        const { name } = req.body
        const folderToUpdate = { name }

        if(!name) {
            return res.status(400).json({
                error: { message: `Request body must contain name`}
            })
        }

        FoldersService.updateFolder(db, id, folderToUpdate)
            .then(rows => {
                res.status(204).end()
            })
        .catch(next)
    })

module.exports = foldersRouter