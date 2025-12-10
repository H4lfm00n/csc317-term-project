// Database initialization script
// Run this separately if you need to reset the database

const { db } = require('./index');
const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function resetDatabase() {
    db.serialize(() => {
        // Drop existing tables
        db.run('DROP TABLE IF EXISTS sessions');
        db.run('DROP TABLE IF EXISTS users');
        
        // Recreate from schema
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error resetting database:', err.message);
            } else {
                console.log('Database reset successfully');
            }
            db.close();
        });
    });
}

// Run if called directly
if (require.main === module) {
    resetDatabase();
}

module.exports = { resetDatabase };

