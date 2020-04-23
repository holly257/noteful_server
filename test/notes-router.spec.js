const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const NotesRouter = require('../src/notes/notes-router')
const { makeTestNotes, makeTestFolders } = require('./makeTestData')

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

        //both giving error with date formatting
        context.only('GET /api/notes', () => {
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
    })
})