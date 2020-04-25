const FoldersService = {
    getAllFolders(db) {
        return db.select('*').from('folders')
    },

    insertFolder(db, newFolder) {
        return db.insert(newFolder).into('folders')
            .returning('*').then(rows => {
                return rows[0]
            })
    },

    getById(db, id) {
        return db.from('folders').select('*')
            .where('id', id).first()
    },

    updateFolder(db, id, newFolderInfo) {
        return db('folders').where({ id }).update(newFolderInfo)
    },
}

module.exports = FoldersService