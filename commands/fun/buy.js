const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./dataBase.db');

module.exports = {
  name: 'buy',
  description: 'Buy a listed skin',
  async execute(message, args) {
    const listingID = args[0];

    db.get(`SELECT * FROM Listings WHERE ListingID = ?`, [listingID], (err, listing) => {
      if (err) {
        console.error(err);
        return message.reply("An error occurred. Please try again later.");
      }

      if (!listing) {
        return message.reply("This listing does not exist.");
      }

      db.get(`SELECT * FROM Money WHERE UserID = ?`, [message.author.id], (err, buyer) => {
        if (err) {
          console.error(err);
          return message.reply("An error occurred. Please try again later.");
        }

        if (!buyer) {
          return message.reply("You do not have an account to make a purchase.");
        }

        if (buyer.Balance < listing.Price) {
          return message.reply("You don't have enough credits to make this purchase.");
        }

        db.serialize(() => {
          db.run(`UPDATE Money SET Balance = Balance - ? WHERE UserID = ?`, [listing.Price, message.author.id], function(err) {
            if (err) return console.error(err);
          })
          .run(`UPDATE Money SET Balance = Balance + ? WHERE UserID = ?`, [listing.Price, listing.UserID], function(err) {
            if (err) return console.error(err);
          })
          .run(`UPDATE userSkins SET UserID = ?, isListed = 0 WHERE id = ?`, [message.author.id, listing.SkinID], function(err) {
            if (err) return console.error(err);
          })
          .run(`INSERT INTO Transactions (BuyerID, SellerID, Price) VALUES (?, ?, ?)`, [message.author.id, listing.UserID, listing.SkinID, listing.Price], function(err) {
            if (err) return console.error(err);
          })
          .run(`DELETE FROM Listings WHERE ListingID = ?`, [listingID], function(err) {
            if (err) {
              console.error(err);
              return message.reply("An error occurred while removing the listing.");
            }
            message.reply(`You've successfully bought the skin for ${listing.Price} credits.`);
          });
        });
      });
    });
  }
};
