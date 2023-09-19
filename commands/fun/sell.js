const { MessageCollector } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./dataBase.db');

module.exports = {
  name: 'sell',
  description: 'Sell a skin',
  async execute(message, args) {
    const skinID = args[0];
    if (!skinID) {
      return message.reply('Please provide the Skin ID you want to sell.');
    }

    // Check if the user owns the skin
    db.get(`SELECT * FROM userSkins WHERE id = ? AND UserID = ?`, [skinID, message.author.id], (err, row) => {
      if (err) {
        console.error(err);
        return message.reply('An error occurred.');
      }

      if (!row) {
        return message.reply('You do not own a skin with that ID.');
      }

      // Ask the user for the price
      message.channel.send('Please enter the price at which you want to list this skin.').then(() => {
        const filter = m => m.author.id === message.author.id;
        const collector = new MessageCollector(message.channel, filter, { max: 1, time: 30000 });

        collector.on('collect', m => {
            collector.stop();  // Stop the collector here
            const price = parseInt(m.content);
            if (isNaN(price) || price <= 0) {
              return message.reply('Please enter a valid price.');
            }
          
            // Insert the listing into the database
            db.run(`INSERT INTO Listings (UserID, SkinID, Price) VALUES (?, ?, ?)`, [message.author.id, skinID, price], function(err) {
              if (err) {
                console.error(err);
                return message.reply('An error occurred while listing the skin.');
              }
          
              // Mark the skin as listed in the userSkins table
              db.run(`UPDATE userSkins SET isListed = 1 WHERE id = ? AND UserID = ?`, [skinID, message.author.id], function(err) {
                if (err) {
                  console.error(err);
                  return message.reply('An error occurred while updating the skin status.');
                }
          
                message.reply(`Your skin has been listed for ${price} credits and removed from your inventory.`);
              });
            });
          });
          

        collector.on('end', collected => {
          if (collected.size === 0) {
            message.reply('You did not enter a price. The listing has been cancelled.');
          }
        });
      });
    });
  }
};
