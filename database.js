const sqlite3 = require('sqlite3').verbose();

// Open database
const db = new sqlite3.Database('./dataBase.db', (err) => {
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

  // Server Config
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

  // Server Roles
  db.run(`CREATE TABLE IF NOT EXISTS server_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT,
    role_name TEXT,
    role_id TEXT,
    permission_level INTEGER
  )`, (err) => {
    if (err) {
      console.error('Server roles table creation failed:', err.message);
    } else {
      console.log('Server roles table created successfully.');
    }
  });

  // Create table for skins
  db.run(`CREATE TABLE IF NOT EXISTS userSkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID TEXT,
    caseCollection TEXT,
    weapon TEXT,
    skinName TEXT,
    rarity TEXT,
    isStatTrak INTEGER
  )`);
});

module.exports = db;
