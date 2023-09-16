const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Initialize database
let db = new sqlite3.Database('./dataBase.db');

// Open a writable stream to a file
const fileStream = fs.createWriteStream('skins_output.txt');

// Write headers to the file
fileStream.write('ID\tCase Collection\tWeapon\tSkin Name\tRarity\n');

// Query the database
db.all('SELECT * FROM skins', [], (err, rows) => {
  if (err) {
    console.error('Error fetching data:', err);
    return;
  }

  // Loop through each row and write to the file
  rows.forEach(row => {
    fileStream.write(`${row.id}\t${row.caseCollection}\t${row.weapon}\t${row.skinName}\t${row.rarity}\n`);
  });

  // Close the file stream
  fileStream.end(() => {
    console.log('Data written to skins_output.txt');
  });
});
