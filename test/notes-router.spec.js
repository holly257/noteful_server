const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const NotesRouter = require('../src/notes/notes-router')
const { makeTestNotes, makeTestFolders, makeMaliciousNote } = require('./makeTestData')

//take out .only

describe('notes-router Endpoints', function() {
    let db
    const testFolders = makeTestFolders()
    const testNotes = makeTestNotes()

    before('make db instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    beforeEach('clean the table', () => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))
    after('disconnect from db', () => db.destroy())
    beforeEach(() => {
            return db
                .into('folders')
                .insert(testFolders)
        })

    context('Given there are notes in the database', () => {
        beforeEach('insert notes', () => {
            return db.into('notes').insert(testNotes)
        })

        context('GET /api/notes', () => {
            it('responds with 200 and all of the notes', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, testNotes)
            })
            it('/:id responds with 200 and the requested note', () => {
                const noteID = 1
                const expectedNote = testNotes[noteID - 1]
                return supertest(app)
                    .get(`/api/notes/${noteID}`)
                    .expect(200, expectedNote)
            })
        })
        it('DELETE /api/notes/:id responds with 204 and removes the note', () => {
            const idToDel = 2
            const expectedNotes = testNotes.filter(note => note.id !== idToDel)
            return supertest(app)
                .delete(`/api/notes/${idToDel}`)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get('/api/notes')
                        .expect(expectedNotes)
                )
        })
        context('PATCH /api/notes', () => {
            it(':id responds with 204 and updates the note', () => {
                const noteID = 2
                const updatedNote = {
                    note_name: 'some note',
                    note_content: 'clean things',
                    folder_id: 2, 
                    date_mod: new Date().toISOString() 
                }
                const expectedNote = {
                    ...testNotes[noteID - 1],
                    ...updatedNote
                }
                return supertest(app)
                    .patch(`/api/notes/${noteID}`)
                    .send(updatedNote)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notes/${noteID}`)
                            .expect(expectedNote)
                    )
            })
            it('responds with 400 when no required fields are given', () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .send({ irrelevant: 'thing' })
                    .expect(400, {
                        error: { message: 'Request body must contain note_name and note_content'}
                    })
            })
            it('responds with 204 when updating only a subset of fields', () => {
                const idToUpdate = 1
                const updatedNote = {
                    note_content: 'fun new content'
                }
                const expectedNote = {
                    ...testNotes[idToUpdate - 1],
                    ...updatedNote
                }
                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .send({
                        ...updatedNote,
                        randomField: 'shoudl not be in GET'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/notes/${idToUpdate}`)
                            .expect(expectedNote)    
                    )
            })
        })
        
        context('Given an XSS attack note', () => {
            const { maliciousNote, expectedNote } = makeMaliciousNote()
            beforeEach('insert malicious note', () => {
                return db.into('notes').insert([ maliciousNote ])
            })
            it('GET /api/notes removes XSS attack content', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[3].note_name).to.eql(expectedNote.note_name)
                        expect(res.body[3].note_content).to.eql(expectedNote.note_content)
                    })
            })
            it('GET /api/notes/:id removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/notes/${maliciousNote.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.note_name).to.eql(expectedNote.note_name)
                        expect(res.body.note_content).to.eql(expectedNote.note_content)
                    })
            })
        })
    })


    context('Given there are no notes in the database', () => {
        it('GET /api/notes/ responds with 200 and an empty array', () => {
            return supertest(app)
                .get('/api/notes')
                .expect(200, [])
        })
        it('GET /api/notes/:id responds with 404', () => {
            const note_id = 1243
            return supertest(app)
                .get(`/api/notes/${note_id}`)
                .expect(404, {
                    error: { message: `Note does not exist`}
                })
        })
        context('POST /api/notes', () => {
            it('creates a note, responding with 201 and the new note', () => {
                this.retries(3)
                const newNote = {
                    note_name: 'a note',
                    note_content: 'clean some things',
                    folder_id: 2, 
                    date_mod: new Date()
                }
                return supertest(app)
                    .post('/api/notes')
                    .send(newNote)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.note_name).to.eql(newNote.note_name)
                        expect(res.body.note_content).to.eql(newNote.note_content)
                        expect(res.body.folder_id).to.eql(newNote.folder_id)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
                        const expected = new Date().toLocaleString()
                        const actual = new Date(res.body.date_mod).toLocaleString()
                        expect(actual).to.eql(expected)
                    })
                    .then(postRes => 
                        supertest(app)
                            .get(`/api/notes/${postRes.body.id}`)
                            .expect(postRes.body)    
                    )
            })
            it('removes XSS attack content', () => {
                const { maliciousNote,expectedNote } = makeMaliciousNote()
                return supertest(app)
                    .post('/api/notes')
                    .send(maliciousNote)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.note_name).to.eql(expectedNote.note_name)
                        expect(res.body.note_content).to.eql(expectedNote.note_content)
                    })
            })
            const requiredFields = ['note_name', 'note_content']
            requiredFields.forEach(field => {
                const reqNewNote = {
                    note_name: 'something',
                    note_content: 'other', 
                    folder_id: 2
                }
                it(`responds with 400 and an error when the '${field}' is missing`, () => {
                    delete reqNewNote[field]
                    return supertest(app)
                        .post('/api/notes')
                        .send(reqNewNote)
                        .expect(400, {
                            error: { message: `Missing ${field} in request body`}
                        })
                })
            })
        })
        it('DELETE /api/notes/:id responds with 404', () => {
            const idToDel = 2
            return supertest(app)
                .delete(`/api/notes/${idToDel}`)
                .expect(404, 
                    { error: { message: 'Note does not exist'}}    
                )
        })
        it('PATCH /api/notes/:id responds with 404', () => {
            const noteID = 2
            return supertest(app)
                .patch(`/api/notes/${noteID}`)
                .expect(404, {
                    error: { message: `Note does not exist`}
                })
        })
    })
})