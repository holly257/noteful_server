const NotesService = require('../src/notes/notes-service')
const knex = require('knex')
const { makeTestFolders, makeTestNotesNoISO } = require('./makeTestData')

describe('Notes Service object', function() {
    let db
    let testFolders = makeTestFolders()
    let testNotes = makeTestNotesNoISO()

    before('make db instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
    })
    
    beforeEach('clean the table', () => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))
    after('disconnect from db', () => db.destroy())
    
    beforeEach(() => {
        return db
            .into('folders')
            .insert(testFolders)
    })

    context(`Given 'notes' has data`, () => {
        beforeEach(() => {
            return db
                .into('notes')
                .insert(testNotes)
        })
        it(`getAllNotes() resolves all notes from 'notes' table`, () => {
            return NotesService.getAllNotes(db)
                .then(actual => {
                    expect(actual).to.eql(testNotes)
                })
        })
        it(`getById() resolves a note by id from 'notes' table`, () => {
            const thirdId = 3
            const thirdTestNote = testNotes[thirdId - 1]
            return NotesService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        name: thirdTestNote.name,
                        content: thirdTestNote.content,
                        folder_id: thirdTestNote.folder_id,
                        modified: thirdTestNote.modified
                    })
                })
        })
        it(`deleteNote() removes a note by id from 'notes' table`, () => {
            const noteId = 3
            return NotesService.deleteNote(db, noteId)
                .then(() => NotesService.getAllNotes(db))
                .then(allNote => {
                    const expected = testNotes.filter(note => note.id !== noteId)
                    expect(allNote).to.eql(expected)
                })
        })
        it(`updateNote() updates a note from the 'notes' table`, () => {
            const idOfNoteToUpate = 3
            const newNoteData = {
                name: 'other note',
                content: 'tasks and stuff',
                folder_id: 3, 
                modified: new Date() 
            }
            return NotesService.updateNote(db, idOfNoteToUpate, newNoteData)
                .then(() => NotesService.getById(db, idOfNoteToUpate))
                .then(note => {
                    expect(note).to.eql({
                        id: idOfNoteToUpate,
                        ...newNoteData,
                    })
                })
        })
    })

    context(`Given 'notes' has no data`, () => {
        it(`getAllNotes() resolves an empty array`, () => {
            return NotesService.getAllNotes(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })
        //broken
        it(`insertNote() inserts a new note and resolves the new note with an 'id'`, () => {
            const newNote = {
                name: 'a note',
                content: 'a task',
                folder_id: 1, 
                modified: new Date() 
            }
            return NotesService.insertNote(db, newNote)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        name: newNote.name,
                        content: newNote.content,
                        folder_id: newNote.folder_id,
                        modified: newNote.modified
                    })
                })
        })
    })
})