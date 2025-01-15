import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.sqlite');

async function getDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}
const createTable = async () => {
     const db = await getDb();
   try {
        await db.exec(`
          CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            type INTEGER NOT NULL,
            timestamp INTEGER NOT NULL,
            data TEXT NOT NULL
          )
        `);
       }
   finally {
       await db.close();
   }
}

export async function insertEvent(event: any) {
    const db = await getDb();
    try {
           await createTable(); // Verifica se a tabela existe antes de usar
        await db.run(
            'INSERT INTO events (session_id, type, timestamp, data) VALUES (?, ?, ?, ?)',
            [event.session_id || "default", event.type, event.timestamp, JSON.stringify(event.data)]
        );
    } finally {
        await db.close();
    }
}

export async function getAllEvents() {
    const db = await getDb();
    try {
        await createTable();
         const events = await db.all('SELECT * FROM events');
      return events.map(event => ({
           ...event,
             data: JSON.parse(event.data)
        }))
    } finally {
        await db.close();
    }
}



export async function getAllSessions() {
    const db = await getDb();
    try {
         await createTable();
         // Added timestamp and grouping
        const sessions = await db.all('SELECT DISTINCT session_id as id, MIN(timestamp) as timestamp FROM events GROUP BY session_id');
        return sessions;
    } finally {
        await db.close();
    }
}

export async function getEventsById(sessionId: string) { // Add this export
  const db = await getDb();
   try {
     await createTable();
     const events = await db.all('SELECT * FROM events WHERE session_id = ?', [sessionId]);
         return events.map(event => ({
           ...event,
             data: JSON.parse(event.data)
        }))
  } finally {
    await db.close();
  }
}