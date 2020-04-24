const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const FoldersRouter = require('../src/folders/folders-router')
const { makeTestFolders, makeTestFoldersNoID, makeMaliciousFolder } = require('./makeTestData')

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
        it('DELETE /api/folders/:id responds with 204 and removes the folder', () => {
            const idToDel = 2
            const expectedFolders = testFolders.filter(folder => folder.id !== idToDel)
            return supertest(app)
                .delete(`/api/folders/${idToDel}`)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get('/api/folders')
                        .expect(expectedFolders)    
                )
        })
        context('Given an XSS attack folder', () => {
            const { maliciousFolder, expectedFolder } = makeMaliciousFolder()
            beforeEach('insert malicious folder', () => {
                return db.into('folders').insert([ maliciousFolder ])
            })
            it('GET /api/folders removes XSS attack content', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[3].folder_name).to.eql(expectedFolder.folder_name)
                    })
            })
            it('GET /api/folders/:id removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/folders/${maliciousFolder.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.folder_name).to.eql(expectedFolder.folder_name)
                    })
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
            it('responds with 400 and an error when the folder_name is missing', () => {
                return supertest(app)
                    .post(`/api/folders`)
                    .send('')
                    .expect(400, {
                        error: { message: `Folder name is required`}
                    })
            })
            it('removes XSS attack content', () => {
                const { maliciousFolder, expectedFolder } = makeMaliciousFolder()
                return supertest(app)
                    .post('/api/folders')
                    .send(maliciousFolder)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.folder_name).to.eql(expectedFolder.folder_name)
                    })
            })
        })
        it('DELETE /api/folders/:id responds with 404', () => {
            const idToDel = 2
            return supertest(app)
                .delete(`/api/folders/${idToDel}`)
                .expect(404, 
                    { error: { message: 'Folder does not exist'}}
                )
        })
    })
})