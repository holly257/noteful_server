const FoldersService = require('../src/folders/folders-service')
const knex = require('knex')

describe('Folders Service object', function() {
    let db
    let testFolders = [
        {
            id: 1,
            folder_name: 'first folder'    
        },
        {
            id: 2,
            folder_name: 'Second folder'    
        },
        {
            id: 3,
            folder_name: 'third folder'    
        },
    ]

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
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
                        folder_name: thirdTestFolder.folder_name,
                    })
                })
        })
        it(`deleteFolder() removes a folder by id from 'folders' table`, () => {
            const folderId = 3
            return FoldersService.deleteFolder(db, folderId)
                .then(() => FoldersService.getAllFolders(db))
                .then(allFolder => {
                    const expected = testFolders.filter(folder => folder.id !== folderId)
                    expect(allFolder).to.eql(expected)
                })
        })
        it(`updateFolder() updates a folder from the 'folders' table`, () => {
            const idOfFolderToUpate = 3
            const newFolderData = {
                folder_name: 'other folder'
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
                folder_name: 'a folder'
            }
            return FoldersService.insertFolder(db, newFolder)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        folder_name: newFolder.folder_name
                    })
                })
        })
    })
})