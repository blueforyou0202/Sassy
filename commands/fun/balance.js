const db = require('../../database');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
  name: 'balance',
  aliases: ['bal'],
  description: 'Check or modify your current balance',
  async execute(message, args) {
    const config = require(global.__basedir + '/config.json');
    const ownerID = config.ownerID;

    if (args[0] === 'add') {
      if (message.author.id !== ownerID) {
        return message.channel.send('You do not have permission to use this command.');
      }

      const amount = parseInt(args[1].substring(1));
      const user = message.mentions.users.first();

      if (!amount || !user) {
        return message.channel.send('Invalid syntax. Use `!bal add $<amount> @<user>`');
      }

      db.run('UPDATE Money SET Balance = Balance + ? WHERE UserID = ?', [amount, user.id], function(err) {
        if (err) {
          console.error('Database error:', err);
          return;
        }
        message.channel.send(`Added $${amount} to @${user.tag}'s balance.`);
      });
    } else {
      db.get('SELECT Balance FROM Money WHERE UserID = ?', [message.author.id], function(err, row) {
        if (err) {
          console.error('Database error:', err);
          return;
        }

        if (!row) {
          db.run('INSERT INTO Money (UserID, Balance) VALUES (?, 0)', [message.author.id], function(err) {
            if (err) {
              console.error('Database error:', err);
            }
          });
          return message.channel.send(`Your current balance is $0`);
        }

        message.channel.send(`Your current balance is $${row.Balance}`);
      });
    }
  }
};
