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

function makeTestNotes() {
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


module.exports = {
    makeTestFolders,
    makeTestNotes
}