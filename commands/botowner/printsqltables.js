const fs = require('fs');
const db = require(`${global.__basedir}/database`);
const config = require(`${global.__basedir}/config.json`);

module.exports = {
  name: 'printsqltables',
  description: 'Lists all tables and their content. Bot owner only.',
  async execute(message, args) {
    if (message.author.id !== config.ownerID) {
      return message.reply('You do not have permission to use this command.');
    }

    let fileContent = 'Database Tables:\n\n';

    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) {
        console.error(err.message);
        return;
      }

      tables.forEach((table) => {
        db.all(`SELECT * FROM ${table.name}`, [], (err, rows) => {
          if (err) {
            console.error(err.message);
            return;
          }

          fileContent += `Table: ${table.name}\n`;
          fileContent += JSON.stringify(rows, null, 2);
          fileContent += '\n\n';

          // Write to file
          fs.writeFile('database_tables.txt', fileContent, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
        });
      });

      message.reply('Database tables have been written to `database_tables.txt`.');
    });
  },
};
