const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Hex codes for skin rarity colors
const rarityColors = {
  'Mil-Spec': '#4B69FF',
  'Restricted': '#8847FF',
  'Classified': '#D32CE6',
  'Covert': '#EB4B4B',
  'Rare Special Item': '#E4AE33'
};

// Define the getUserSkinsFromDatabase function
async function getUserSkinsFromDatabase(userId) {
  return new Promise((resolve, reject) => {
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
    const userSkins = await getUserSkinsFromDatabase(message.author.id);

    // Added logging for debugging
    console.log('Number of user skins:', userSkins.length);
    console.log('First few user skins:', userSkins.slice(0, 5));

    console.log('Executing !viewskin command');

    const skinIndex = parseInt(args[0]);

    // Added logging for debugging
    console.log('Provided skin index:', skinIndex);

    // Potential Fix 1: Use Database ID for Validation
    const validSkinIds = userSkins.map(skin => skin.id);
    if (!validSkinIds.includes(skinIndex)) {
      message.reply('please provide a valid skin index.');
      return;
    }

    /*
    // Potential Fix 2: Fetch the Skin Directly from the Database
    db.get('SELECT * FROM userSkins WHERE id = ? AND UserID = ?', [skinIndex, message.author.id], (err, row) => {
      if (err || !row) {
        message.reply('please provide a valid skin index.');
        return;
      }
      // rest of the code
    });
    */

    const selectedSkin = userSkins.find(skin => skin.id === skinIndex);  // Modified this line to find the skin by its database ID
    console.log('Selected Skin:', selectedSkin);

    // Get the color based on the skin's rarity
    const embedColor = rarityColors[selectedSkin.rarity] || '#FFFFFF';  // Default to white if rarity is not recognized

    const wearCondition = getCondition(selectedSkin.floatVal);

    const embed = new MessageEmbed() // Changed from EmbedBuilder to MessageEmbed
      .setTitle(`[#${selectedSkin.skinId}] (${getCondition(selectedSkin.floatVal)}) ${selectedSkin.weapon} | ${selectedSkin.skinName}`)
      .addFields(
        { name: 'Collection', value: selectedSkin.caseCollection },
        { name: 'Weapon', value: selectedSkin.weapon },
        { name: 'Skin', value: selectedSkin.skinName },
        { name: 'Rarity', value: selectedSkin.rarity },
        { name: 'StatTrak', value: selectedSkin.isStatTrak ? 'Yes' : 'No' },
        { name: 'Description', value: selectedSkin.description },
        { name: 'Category', value: selectedSkin.categoryName },
        { name: 'Pattern', value: selectedSkin.patternName },
        { name: 'Min Float', value: selectedSkin.min_float },
        { name: 'Max Float', value: selectedSkin.max_float },
        { name: 'Float Value', value: selectedSkin.floatVal ? selectedSkin.floatVal.toString() : 'N/A' }
      )
      .setColor(embedColor);

    message.channel.send({ embeds: [embed] });
  },
};

// Function to get the wear condition name based on float value
function getCondition(floatValue) {
  if (floatValue >= 0 && floatValue < 0.07) {
    return 'Factory New';
  } else if (floatValue >= 0.07 && floatValue < 0.15) {
    return 'Minimal Wear';
  } else if (floatValue >= 0.15 && floatValue < 0.37) {
    return 'Field-Tested';
  } else if (floatValue >= 0.37 && floatValue < 0.44) {
    return 'Well-Worn';
  } else {
    return 'Battle-Scarred';
  }
}
