const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { insert_test_med } = require("../../tests/test_script/insert_test_medicines");

const isTest = process.env.NODE_ENV === "test";

const dbPath = isTest
    ? ":memory:" // or path.join(__dirname, "test.db")
    : path.join(__dirname, '../../data/db/inhalers.db');


const db = new Database(dbPath, {
    busyTimeout: 5000
});

db.pragma("foreign_keys = ON");
db.pragma('journal_mode = WAL');

if (isTest) {
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
    db.exec(schema);

    const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf-8");
    db.exec(seed);

    insert_test_med(db);
    console.log("TEST DB initialized");
} else {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    if (tables.length === 0) {
        
        const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
        db.exec(schema);
        console.log("Database schema initialized!");
        
        const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf-8");
        db.exec(seed);
        console.log("Database seeded!");
    }
}

// tables added after launch, created here so they also reach the existing production database
db.exec(fs.readFileSync(path.join(__dirname, "guides.sql"), "utf-8"));

module.exports = db;