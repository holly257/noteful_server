const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const FoldersRouter = require('../src/folders/folders-router')
const { makeTestFolders, makeTestFoldersNoID } = require('./makeTestData')

//take out the .only

describe('folders-router Endpoints', function() {
    let db
    const testFolders = makeTestFolders()
    before('make db instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    beforeEach('clean the table', () => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))
    after('disconnect from db', () => db.destroy())

    context('Given there are folders in the database', () => {
        beforeEach('insert folders', () => {
            return db.into('folders').insert(testFolders)
        })

        context('GET /api/folders', () => {
            it('responds with 200 and all of the folders', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, testFolders)
            })
            it('/:id responds with 200 and the requested folder', () => {
                const folderId = 2
                const expectedFolder = testFolders[folderId - 1]
                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(200, expectedFolder)
            })
        })
        
        
    })
    //also test for post with data but no IDs

    context('Given there are no folders in the database', () => {
        context('GET api/folders', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, [])
            })
            it('/:id responds with 404', () => {
                    const folderId = 2452
                    return supertest(app)
                        .get(`/api/folders/${folderId}`)
                        .expect(404, {
                            error: { message: `Folder does not exist`}
                        })
            })
        })
    
        
        context('POST /api/folders', () => {
            it('creates a folder, responding with 201 and the new folder', () => {
                const newFolder = {
                    folder_name: 'hello'
                }
                return supertest(app)
                    .post('/api/folders')
                    .send(newFolder)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.folder_name).to.eql(newFolder.folder_name)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
                    })
                    .then(postRes =>
                        supertest(app)
                            .get(`/api/folders/${postRes.body.id}`)
                            .expect(postRes.body)    
                    )
            })
        })
    })
})