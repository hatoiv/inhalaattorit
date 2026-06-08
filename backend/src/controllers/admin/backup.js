const path = require('path');
const fs = require('fs');
const BackendError = require('../../classes/backendError');
const db = require('../../db/database');

class backup {

    static download = (req, res, next) => {

        const pathToDb = path.join(__dirname, '../../../data/db/inhalers.db');

        if(!fs.existsSync(pathToDb)) {
            throw new BackendError(404, 'Backup file not found')
        }

        db.pragma('wal_checkpoint(FULL)');

        res.setHeader('Content-Type', 'application/octet-stream');

        res.download(pathToDb, 'inhalers.db', (err) => {
            if(err) {
                console.error('Download error:', err);
                return next(new BackendError(500, 'Failed to send file'));
            }
        });
    };
}

module.exports = backup;
