// Database connection and utilities
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'orbitcart.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database with schema
function initializeDatabase() {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing database schema:', err.message);
        } else {
            console.log('Database schema initialized');
        }
    });
}

// Database helper functions
const dbHelpers = {
    // User operations
    getUserByUsername: (username) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    getUserByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    getUserById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT id, username, email, name, created_at FROM users WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    createUser: (username, email, hashedPassword, name) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, email, password, name) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, name],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, username, email, name });
                }
            );
        });
    }
};

module.exports = { db, dbHelpers };

