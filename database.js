const sqlite3 = require('sqlite3').verbose();

// Open database
const db = new sqlite3.Database('./dataBase.db', (err) => {
  if (err) {
    console.error('Could not connect to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Function to run a query and log the server ID and the query itself
db.runWithServerLog = function (query, params, serverId) {
  console.log(`Running query for server ${serverId}: ${query}`); // Log the query
  this.run(query, params, function (err) {
    if (err) {
      console.error(`Query failed for server ${serverId}:`, err.message);
    } else {
      console.log(`Query succeeded for server ${serverId}.`);
    }
  });
};

// Create tables if they don't exist
db.serialize(() => {
  // Actions Table
  db.run(`CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    user_id TEXT,
    moderator_id TEXT,
    server_id TEXT,
    reason TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Server Config Table
  db.run(`CREATE TABLE IF NOT EXISTS server_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT,
    prefix TEXT
  )`);

  // Server Roles Table
  db.run(`CREATE TABLE IF NOT EXISTS server_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT,
    role_name TEXT,
    role_id TEXT,
    permission_level INTEGER
  )`);

// Updated User Skins Table
db.run(`CREATE TABLE IF NOT EXISTS userSkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  UserID TEXT,
  skinId TEXT,
  name TEXT,
  description TEXT,
  weapon TEXT, 
  weaponId TEXT,
  weaponName TEXT,
  categoryId TEXT,
  categoryName TEXT,
  patternId TEXT,
  patternName TEXT,
  min_float REAL,
  max_float REAL,
  rarityId TEXT,
  rarityName TEXT,
  stattrak INTEGER,
  souvenir INTEGER,
  paint_index INTEGER,
  wears TEXT,
  collections TEXT,
  crates TEXT,
  image TEXT,
  caseCollection TEXT,
  skinName TEXT,
  rarity TEXT,
  isStatTrak TEXT,
  floatVal REAL,
  condition TEXT
)`, (err) => {
  if (err) {
    console.error('User skins table creation failed:', err.message);
  } else {
    console.log('User skins table created successfully.');
  }
}) 
})
module.exports = db;
