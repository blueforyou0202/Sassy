const sqlite3 = require('sqlite3').verbose();

// Open database
const db = new sqlite3.Database('./moderationLogs.db', (err) => {
  if (err) {
    console.error('Could not connect to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Function to run a query and log the server ID
db.runWithServerLog = function(query, params, serverId) {
  this.run(query, params, function(err) {
    if (err) {
      console.error(`Query failed for server ${serverId}:`, err.message);
    } else {
      console.log(`Query succeeded for server ${serverId}.`);
    }
  });
};

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    user_id TEXT,
    moderator_id TEXT,
    server_id TEXT,
    reason TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Table creation failed:', err.message);
    } else {
      console.log('Table created successfully.');
    }
  });

  // Create table for server_config
  db.run(`CREATE TABLE IF NOT EXISTS server_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT,
    prefix TEXT
  )`, (err) => {
    if (err) {
      console.error('Server config table creation failed:', err.message);
    } else {
      console.log('Server config table created successfully.');
    }
  });

  // Check if server_id column exists
  db.all(`PRAGMA table_info(actions)`, [], (err, rows) => {
    if (err) {
      console.error('Failed to get table information:', err.message);
      return;
    }

    const hasServerId = rows.some(row => row.name === 'server_id');

    if (!hasServerId) {
      // Alter table to add server_id column
      db.run(`ALTER TABLE actions ADD COLUMN server_id TEXT`, (err) => {
        if (err) {
          console.error('Table alteration failed:', err.message);
        } else {
          console.log('Table altered successfully.');
        }
      });
    }
  });
});

module.exports = db;
