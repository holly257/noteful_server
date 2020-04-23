const { expect } = require('chai')
const knex = require('knex')
const foldersRouter = require('../src/folders/folders-router')

describe('FoldersRouter Endpoints', function() {
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

    context('Given there are folders in the database', () =>{
        
    })
})