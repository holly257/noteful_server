const { expect } = require('chai')
const knex = require('knex')
const foldersRouter = require('../src/folders/folders-router')
const { makeTestFolders } = require('./makeTestData')

//take out the .only

describe.only('FoldersRouter Endpoints', function() {
    let db
    before('make db instance', () => {
        db = knex({
            client: 'pg',
            connection: 'process.env.TEST_DB_URL',
        })
        app.set('db', db)
    })
    after('disconnect from db', () => db.destroy())
    beforeEach('clean the table', () => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))

    context('Given there are folders in the database', () => {
        const testFolders = makeTestFolders()
        beforeEach('insert folders', () => {
            return db.into('folders').insert(testFolders)
        })

        context('GET /api/folders', () => {
            it('responds with 200 and all of the folders', () => {
                return supertest(foldersRouter)
                    .get('/api/articles')
                    .expect(200, testFolders)
            })
            it('/:id responds with 200 and the requested folder', () => {
                const folderId = 2
                const expectedFolder = testFolders[folderId - 1]
                return supertest(foldersRouter)
                    .get('/api/articles/:id')
                    .expect(200, expectedFolder)
            })
        })
    })
})