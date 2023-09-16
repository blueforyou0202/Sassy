const EmbedBuilder = require('discord.js').MessageEmbed; // Assuming you've updated to v14
const sqlite3 = require('sqlite3').verbose();

module.exports = {
  name: 'case',
  description: 'Open a CSGO weapon case',
  async execute(message, args, client) {
    // Initialize database (assuming you have a database setup)
    let db = new sqlite3.Database('./skins.db');

    // Create an initial embed
    const embed = new EmbedBuilder()
      .setTitle('Opening Case...')
      .setDescription('Rolling for a skin...');
    
    // Send initial embed
    const msg = await message.channel.send({ embeds: [embed] });

    // Simulate case opening (this is where you'd put your animation logic)
    setTimeout(async () => {
      const selectedSkin = getRandomSkin(); // Implement this function
      embed.setTitle('Case Opened!')
           .setDescription(`You got: ${selectedSkin.name}`);
      
      // Update the embed
      await msg.edit({ embeds: [embed] });

      // Save to database
      db.run(`INSERT INTO userSkins (UserID, SkinName, Rarity) VALUES (?, ?, ?)`, [message.author.id, selectedSkin.name, selectedSkin.rarity]);
    }, 3000);
  }
};

// Implement your getRandomSkin function here
function getRandomSkin() {
  // Your logic to select a skin based on its rarity
}
