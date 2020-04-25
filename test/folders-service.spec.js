const FoldersService = require('../src/folders/folders-service')
const knex = require('knex')
const { makeTestFolders } = require('./makeTestData')

describe('Folders Service object', function() {
    let db
    let testFolders = makeTestFolders()

    before('make db instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
    })
    
    beforeEach('clean the table', () => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))
    after('disconnect from db', () => db.destroy())
    
    context(`Given 'folders' has data`, () => {
        beforeEach(() => {
            return db
                .into('folders')
                .insert(testFolders)
        })
        it(`getAllFolders() resolves all folders from 'folders' table`, () => {
            return FoldersService.getAllFolders(db)
                .then(actual => {
                    expect(actual).to.eql(testFolders)
                })
        })
        it(`getById() resolves a folder by id from 'folders' table`, () => {
            const thirdId = 3
            const thirdTestFolder = testFolders[thirdId - 1]
            return FoldersService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        name: thirdTestFolder.name,
                    })
                })
        })
        it(`updateFolder() updates a folder from the 'folders' table`, () => {
            const idOfFolderToUpate = 3
            const newFolderData = {
                name: 'other folder'
            }
            return FoldersService.updateFolder(db, idOfFolderToUpate, newFolderData)
                .then(() => FoldersService.getById(db, idOfFolderToUpate))
                .then(folder => {
                    expect(folder).to.eql({
                        id: idOfFolderToUpate,
                        ...newFolderData,
                    })
                })
        })
    })

    context(`Given 'folders' has no data`, () => {
        it(`getAllFolders() resolves an empty array`, () => {
            return FoldersService.getAllFolders(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })

        it(`insertFolder() inserts a new folder and resolves the new folder with an 'id'`, () => {
            const newFolder = { 
                name: 'a folder'
            }
            return FoldersService.insertFolder(db, newFolder)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        name: newFolder.name
                    })
                })
        })
    })
})