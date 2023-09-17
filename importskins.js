const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Open database
const db = new sqlite3.Database('./dataBase.db', (err) => {
  if (err) {
    console.error('Could not connect to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Read the skins.json file
fs.readFile('./skins.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  const skins = JSON.parse(data);

  // Insert each skin into the userSkins table
  skins.forEach((skin) => {
    const query = `
      INSERT INTO userSkins (
        UserID, caseCollection, weapon, skinName, rarity, isStatTrak, floatVal, condition, skinId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      skin.UserID,
      skin.caseCollection,
      skin.weapon,
      skin.skinName,
      skin.rarity,
      skin.isStatTrak,
      skin.floatVal,
      skin.condition,
      skin.skinId
    ];

    db.run(query, params, (err) => {
      if (err) {
        console.error('Error inserting skin:', err.message);
      }
    });
  });
});
