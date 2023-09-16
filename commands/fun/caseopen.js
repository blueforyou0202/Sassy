const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = require('../../database');

// Initialize the userSkins Map
const userSkins = new Map();

// Cooldowns for the caseopen command (adjust as needed)
const cooldowns = new Map();

// Path to the allcsgoskins.json file
const skinsFilePath = path.join(__basedir, 'allcsgoskins.json');

// Hex codes for skin rarity colors
const rarityColors = {
  'Mil-Spec': '#4B69FF',
  'Restricted': '#8847FF',
  'Classified': '#D32CE6',
  'Covert': '#EB4B4B',
  'Rare Special Item': '#E4AE33'
};

module.exports = {
  name: 'caseopen',
  aliases: ['case'],
  description: 'Open a CSGO weapon case',
  async execute(message, args, client) {
    // Check if the user is on cooldown
    if (cooldowns.has(message.author.id)) {
      const expirationTime = cooldowns.get(message.author.id);
      if (Date.now() < expirationTime) {
        const timeLeft = (expirationTime - Date.now()) / 1000;
        message.reply(`please wait ${timeLeft.toFixed(1)} more seconds before using the caseopen command again.`);
        return;
      }
    }
    const caseemoji = client.emojis.cache.get('1152495572696178709');
    // Set a cooldown for the user (adjust the cooldown time as needed)
    const cooldownTime = 3000; // 3 seconds
    cooldowns.set(message.author.id, Date.now() + cooldownTime);

    // Read the allcsgoskins.json file to get skin data
    const skinsData = require(skinsFilePath);

    // Create an initial embed
    const embed = new EmbedBuilder()
      .setTitle(`${caseemoji} Opening Case...`)
      .setDescription('Rolling for a skin...');

    // Send initial embed
    const msg = await message.channel.send({ embeds: [embed] });

    // Simulate case opening
    setTimeout(async () => {
      try {
        const selectedSkin = await getRandomSkin(skinsData);
        const skinIndex = userSkins.size + 1; // Calculate the skin index
        const skinTitle = `[#${skinIndex}] ${selectedSkin.floatVal ? `(${getCondition(selectedSkin.floatVal)}) ` : ''}${selectedSkin.weapon} | ${selectedSkin.skinName}`;
        const skinColor = rarityColors[selectedSkin.rarity] || '#FFFFFF'; // Default to white if rarity is not recognized
        embed.setTitle(skinTitle)
          .setDescription(`Collection: ${selectedSkin.caseCollection}\nWeapon: ${selectedSkin.weapon}\nSkin: ${selectedSkin.skinName}\nRarity: ${selectedSkin.rarity}\nStatTrak: ${selectedSkin.isStatTrak ? 'Yes' : 'No'}`)
          .setColor(skinColor);

        // Update the embed
        await msg.edit({ embeds: [embed] });

        // Save the selected skin to the database (You'll need to create a table for user skins)
        db.run(`INSERT INTO userSkins (UserID, caseCollection, weapon, skinName, rarity, isStatTrak, floatVal, condition) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [message.author.id, selectedSkin.caseCollection, selectedSkin.weapon, selectedSkin.skinName, selectedSkin.rarity, selectedSkin.isStatTrak ? 1 : 0, selectedSkin.floatVal, getCondition(selectedSkin.floatVal)]);

        // Store the user's skin with an index
        userSkins.set(skinIndex, selectedSkin);
      } catch (error) {
        console.error('An error occurred:', error);
        message.channel.send('An error occurred while opening the case.');
      }
    }, 1000);
  }
};

// Function to get a random skin from the provided skinsData
function getRandomSkin(skinsData) {
  return new Promise((resolve, reject) => {
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

    // Filter skins from the provided data by the selected rarity
    const filteredSkins = skinsData.filter(skin => skin.rarity === selectedRarity);

    // Randomly select a skin from the filtered list
    const selectedSkin = filteredSkins[Math.floor(Math.random() * filteredSkins.length)];

    if (!selectedSkin) {
      reject(new Error('No skin could be selected.'));
      return;
    }

    // Add StatTrak information
    selectedSkin.isStatTrak = isStatTrak;

    // Add float value information
    selectedSkin.floatVal = getRandomFloatValue();

    resolve(selectedSkin);
  });
}

// Function to get a random float value based on CS:GO wear conditions
function getRandomFloatValue() {
  const wearConditions = [
    { name: 'Factory New', min: 0, max: 0.07 },
    { name: 'Minimal Wear', min: 0.07, max: 0.15 },
    { name: 'Field-Tested', min: 0.15, max: 0.37 },
    { name: 'Well-Worn', min: 0.37, max: 0.44 },
    { name: 'Battle-Scarred', min: 0.44, max: 1 }
  ];

  // Generate a random float value based on wear conditions
  const randomFloat = Math.random();
  for (const condition of wearConditions) {
    if (randomFloat >= condition.min && randomFloat <= condition.max) {
      return randomFloat.toFixed(2); // Keep two decimal places
    }
  }

  return randomFloat.toFixed(2); // Default to two decimal places
}

// Function to get the condition name based on float value
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
