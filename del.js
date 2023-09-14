const sqlite3 = require('sqlite3').verbose();

// Open database
const db = new sqlite3.Database('./moderationLogs.db', (err) => {
  if (err) {
    return console.error('Could not connect to database:', err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Delete all rows where the prefix is empty
db.run("DELETE FROM server_config WHERE prefix = ''", function(err) {
  if (err) {
    return console.error('Error while deleting:', err.message);
  }
  console.log(`Deleted ${this.changes} row(s)`);
});

// Close the database
db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Closed the database connection.');
});
