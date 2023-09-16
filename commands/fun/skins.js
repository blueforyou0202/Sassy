const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./dataBase.db');

module.exports = {
  name: 'skins',
  description: 'Display all the skins you own',
  async execute(message, args, client) {
    db.all(`SELECT * FROM userSkins WHERE UserID = ?`, [message.author.id], (err, rows) => {
      if (err) {
        console.error(err);
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${message.author.username}'s Skins`)
        .setDescription('Here are all the skins you own:')
        .setColor(0x0099FF);

      const fields = [];
      rows.forEach((row, index) => {
        let wearCondition;
        if (row.floatVal <= 0.07) wearCondition = "Factory New";
        else if (row.floatVal <= 0.15) wearCondition = "Minimal Wear";
        else if (row.floatVal <= 0.37) wearCondition = "Field-Tested";
        else if (row.floatVal <= 0.44) wearCondition = "Well-Worn";
        else wearCondition = "Battle-Scarred";

        const statTrak = row.isStatTrak ? "StatTrak™ " : "";
        const title = `[${index + 1}] (${wearCondition}) ${statTrak}${row.weapon} | ${row.skinName}`;

        const value = `
          Collection: ${row.caseCollection}
          Weapon: ${row.weapon}
          Skin: ${row.skinName}
          Rarity: ${row.rarity}
          StatTrak: ${row.isStatTrak ? 'Yes' : 'No'}
        `;

        fields.push({ name: title, value: value });
      });

      embed.addFields(fields);
      message.channel.send({ embeds: [embed] });
    });
  }
};