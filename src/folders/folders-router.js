const path = require('path')
const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')
const foldersRouter = express.Router()
const jsonParser = express.json()

const sanitizeFolders = folders => ({
    folder_name: xss(folders.folder_name),
})