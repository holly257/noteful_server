function makeTestFolders() {
    return [
        {
            id: 1,
            name: 'first folder'    
        },
        {
            id: 2,
            name: 'Second folder'    
        },
        {
            id: 3,
            name: 'third folder'    
        },
    ]
}

function makeTestNotesNoISO() {
    return [
        {
            id: 1,
            name: 'first note',
            content: 'clean all the things',
            folder_id: 1, 
            modified: new Date()   
        },
        {
            id: 2,
            name: 'Second note',
            content: 'clean things',
            folder_id: 2, 
            modified: new Date()   
        },
        {
            id: 3,
            name: 'third note',
            content: 'tasks',
            folder_id: 3, 
            modified: new Date()
        },
    ]
}

function makeTestNotes() {
    return [
        {
            id: 1,
            name: 'first note',
            content: 'clean all the things',
            folder_id: 1, 
            modified: new Date().toISOString()   
        },
        {
            id: 2,
            name: 'Second note',
            content: 'clean things',
            folder_id: 2, 
            modified: new Date().toISOString()   
        },
        {
            id: 3,
            name: 'third note',
            content: 'tasks',
            folder_id: 3, 
            modified: new Date().toISOString()
        },
    ]
}

function makeMaliciousFolder() {
    const maliciousFolder = {
        id: 911,
        name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    }
    const expectedFolder = {
        ...maliciousFolder,
        name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    }
    return {
        maliciousFolder,
        expectedFolder
    }
}

function makeMaliciousNote() {
    const maliciousNote = {
        id: 911,
        name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        folder_id: 1
    }
    const expectedNote = {
        ...maliciousNote,
        name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
        maliciousNote,
        expectedNote
    }
}

module.exports = {
    makeTestFolders,
    makeTestNotes,
    makeTestNotesNoISO,
    makeMaliciousFolder,
    makeMaliciousNote
}