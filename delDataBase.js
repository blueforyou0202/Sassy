const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'dataBase.db'); // Adjust the path if your database is in a different directory

fs.unlink(dbPath, (err) => {
  if (err) {
    console.error(`Error while deleting database: ${err}`);
  } else {
    console.log('Database deleted successfully.');
  }
});
