const { Pagination } = require('pagination.djs');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./dataBase.db');

module.exports = {
  name: 'shop',
  aliases: ['market'],
  description: 'View the market',
  async execute(message) {
    db.all(`SELECT * FROM Listings`, [], async (err, rows) => {
      if (err) {
        console.error(err);
        return message.channel.send("An error occurred while fetching the market listings.");
      }

      const embeds = [];
      for (let i = 0; i < rows.length; i += 10) {
        const current = rows.slice(i, i + 10);

        const fieldsArray = await Promise.all(current.map(async row => {
          // Fetch Skin Index ID from UserSkins table
          let skinIndexID;
          await new Promise(resolve => {
            db.get(`SELECT id FROM userSkins WHERE id = ?`, [row.SkinID], (err, userSkinRow) => {
              if (err) {
                console.error(err);
              } else {
                skinIndexID = userSkinRow ? userSkinRow.id : 'N/A';
              }
              resolve();
            });
          })

          // Check if the user is in the current server
          const seller = message.guild.members.cache.get(row.UserID);
          const sellerDisplay = seller ? `<@${row.UserID}>` : `User ID: ${row.UserID}`;
          const formattedTimestamp = `${row.Timestamp.split(' ')[1]} ${row.Timestamp.split(' ')[0]}`;
          return {
            name: `[Skin Index #${skinIndexID}]`, // Use the fetched SkinIndexID
            value: `Price: $${row.Price}\nSeller: ${sellerDisplay}\nTimestamp: ${formattedTimestamp}`
          };
        }));

        embeds.push({
          fields: fieldsArray,
          color: 0x0099ff,
          author: { name: `Market Listings (Page ${Math.floor(i / 10) + 1})` },
        });
      }

      const pagination = new Pagination(message, {
        limit: 1,
        idle: 30000,
      });

      try {
        pagination.setEmbeds(embeds);
        pagination.render();
      } catch (error) {
        console.error('Failed to render pagination:', error);
      }
    });
  }
};
