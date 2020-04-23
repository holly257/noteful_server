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


module.exports = foldersRouter