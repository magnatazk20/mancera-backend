import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../noor661.db')

// Ensure data directory exists
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
})

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;')
// Enable WAL mode for better concurrency
db.exec('PRAGMA journal_mode = WAL;')
// Enable JSON1 extension
db.exec('PRAGMA functions = json;')

export const DB_PATH = dbPath
export default db
