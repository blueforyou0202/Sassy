const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Initialize database
let db = new sqlite3.Database('./dataBase.db');

module.exports = {
  name: 'caseopen',
  description: 'Open a CSGO weapon case',
  async execute(message, args, client) {
    // Read the allcsgoskins.txt file and populate the database
    fs.readFile('allcsgoskins.txt', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
        return;
      }
      
      const blocks = data.split('\n\n');
      blocks.forEach(block => {
        const [caseCollection, weapon, skinName, rarity] = block.split('\n');
        db.run(`INSERT INTO skins (caseCollection, weapon, skinName, rarity) VALUES (?, ?, ?, ?)`, [caseCollection, weapon, skinName, rarity]);
      });
    });

    // Create an initial embed
    const embed = new EmbedBuilder()
      .setTitle('Opening Case...')
      .setDescription('Rolling for a skin...');
    
    // Send initial embed
    const msg = await message.channel.send({ embeds: [embed] });

    // Simulate case opening
    setTimeout(async () => {
      const selectedSkin = await getRandomSkin();
      if (!selectedSkin) {
        console.error("An error occurred: No skin could be selected.");
        return;
      }
      embed.setTitle('Case Opened!')
           .setDescription(`You got: ${selectedSkin.skinName}`);
      
      // Update the embed
      await msg.edit({ embeds: [embed] });

      // Save to database (You'll need to create a table for user skins)
      db.run(`INSERT INTO userSkins (UserID, SkinID) VALUES (?, ?)`, [message.author.id, selectedSkin.id]);
    }, 3000);
  }
};

// Function to get a random skin
async function getRandomSkin() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM skins`, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      // Define the rarity percentages
      const rarityPercentages = {
        'Mil-Spec': { normal: 79.92, statTrak: 7.99 },
        'Restricted': { normal: 15.98, statTrak: 1.59 },
        'Classified': { normal: 3.2, statTrak: 0.32 },
        'Covert': { normal: 0.64, statTrak: 0.064 },
        'Rare Special Item': { normal: 0.26, statTrak: 0.026 }
      };

      // Generate a random number between 0 and 100
      const randomNum = Math.random() * 100;
      console.log(`Random Number: ${randomNum}`);

      // Determine the rarity based on the random number
      let cumulativeProbability = 0;
      let selectedRarity = null;
      let isStatTrak = false;

      for (const [rarity, percentages] of Object.entries(rarityPercentages)) {
        cumulativeProbability += percentages.normal;
        if (randomNum < cumulativeProbability) {
          selectedRarity = rarity;
          break;
        }

        cumulativeProbability += percentages.statTrak;
        if (randomNum < cumulativeProbability) {
          selectedRarity = rarity;
          isStatTrak = true;
          break;
        }
      }

      console.log(`Selected Rarity: ${selectedRarity}`);

      // Filter skins by the selected rarity
      const filteredSkins = rows.filter(row => row.rarity === selectedRarity);
      console.log(`Filtered Skins: ${JSON.stringify(filteredSkins)}`);

      // Randomly select a skin from the filtered list
      const selectedSkin = filteredSkins[Math.floor(Math.random() * filteredSkins.length)];
      console.log(`Selected Skin: ${JSON.stringify(selectedSkin)}`);

      // Add StatTrak information
      if (selectedSkin) {
        selectedSkin.isStatTrak = isStatTrak;
      }

      resolve(selectedSkin);
    });
  });
}
