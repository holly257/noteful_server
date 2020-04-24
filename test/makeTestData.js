function makeTestFolders() {
    return [
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
}

function makeTestFoldersNoID() {
    return [
        {
            folder_name: 'first folder'    
        },
        {
            folder_name: 'Second folder'    
        },
        {
            folder_name: 'third folder'    
        },
    ]
}

function makeTestNotesNoISO() {
    return [
        {
            id: 1,
            note_name: 'first note',
            note_content: 'clean all the things',
            folder_id: 1, 
            date_mod: new Date()   
        },
        {
            id: 2,
            note_name: 'Second note',
            note_content: 'clean things',
            folder_id: 2, 
            date_mod: new Date()   
        },
        {
            id: 3,
            note_name: 'third note',
            note_content: 'tasks',
            folder_id: 3, 
            date_mod: new Date()
        },
    ]
}

function makeTestNotes() {
    return [
        {
            id: 1,
            note_name: 'first note',
            note_content: 'clean all the things',
            folder_id: 1, 
            date_mod: new Date().toISOString()   
        },
        {
            id: 2,
            note_name: 'Second note',
            note_content: 'clean things',
            folder_id: 2, 
            date_mod: new Date().toISOString()   
        },
        {
            id: 3,
            note_name: 'third note',
            note_content: 'tasks',
            folder_id: 3, 
            date_mod: new Date().toISOString()
        },
    ]
}

function makeTestNotesNoID() {
    return [
        {
            note_name: 'first note',
            note_content: 'clean all the things',
            folder_id: 1, 
            date_mod: new Date() 
        },
        {
            note_name: 'Second note',
            note_content: 'clean things',
            folder_id: 2, 
            date_mod: new Date()   
        },
        {
            note_name: 'third note',
            note_content: 'tasks',
            folder_id: 3, 
            date_mod: new Date()
        },
    ]
}

function makeMaliciousFolder() {
    const maliciousFolder = {
        id: 911,
        folder_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    }
    const expectedFolder = {
        ...maliciousFolder,
        folder_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    }
    return {
        maliciousFolder,
        expectedFolder
    }
}

function makeMaliciousNote() {
    const maliciousNote = {
        id: 911,
        note_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        note_content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        folder_id: 1
    }
    const expectedNote = {
        ...maliciousNote,
        note_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        note_content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
        maliciousNote,
        expectedNote
    }
}

module.exports = {
    makeTestFolders,
    makeTestFoldersNoID,
    makeTestNotes,
    makeTestNotesNoID,
    makeTestNotesNoISO,
    makeMaliciousFolder,
    makeMaliciousNote
}