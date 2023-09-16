const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Define the getUserSkinsFromDatabase function
async function getUserSkinsFromDatabase(userId) {
  return new Promise((resolve, reject) => {
    // Replace 'your_table_name' with the actual name of your table
    db.all('SELECT * FROM userSkins WHERE userId = ?', [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

let db = new sqlite3.Database('./dataBase.db');

module.exports = {
  name: 'viewskin',
  description: 'View an individual skin by its index',
  async execute(message, args, client) {
    // Use the getUserSkinsFromDatabase function to fetch userSkins data from your database
    const userSkins = await getUserSkinsFromDatabase(message.author.id);

    console.log('Executing !viewskin command');

    const skinIndex = parseInt(args[0]);

    if (isNaN(skinIndex) || skinIndex <= 0 || skinIndex > userSkins.length) {
      message.reply('please provide a valid skin index.');
      return;
    }

    // Retrieve the selected skin based on the index
    const selectedSkin = userSkins[skinIndex - 1];
    console.log('Selected Skin:', selectedSkin);

    // Create an embed to display the individual skin
    const embed = new EmbedBuilder()
      .setTitle(`Skin Details for [${skinIndex}]`)
      .addField('Collection', selectedSkin.caseCollection)
      .addField('Weapon', selectedSkin.weapon)
      .addField('Skin', selectedSkin.skinName)
      .addField('Rarity', selectedSkin.rarity)
      .addField('StatTrak', selectedSkin.isStatTrak ? 'Yes' : 'No')
      .setColor(0x0099FF);

    message.channel.send({ embeds: [embed] });
  },
};
