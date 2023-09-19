const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = require('../../database');
const fs = require('fs'); // Add this import for reading JSON files

// Initialize the userSkins Map
const userSkins = new Map();

// Cooldowns for the caseopen command (adjust as needed)
const cooldowns = new Map();

// Path to the skins.json file
const skinsFilePath = path.join(__dirname, '..', '..', 'skins.json'); // Update this path to your skins.json file

// Hex codes for skin rarity colors
const rarityColors = {
  'Mil-Spec Grade': '#4B69FF',
  'Restricted': '#8847FF',
  'Classified': '#D32CE6',
  'Covert': '#EB4B4B',
  'Extraordinary': '#E4AE33'
};

module.exports = {
  name: 'caseopen',
  aliases: ['case'],
  description: 'Open a CSGO weapon case',
  async execute(message, args, client) {
    // Logging 1: Add a log for starting the command execution
    // console.log('Starting caseopen command execution.');

    // Check if the user is on cooldown
    if (cooldowns.has(message.author.id)) {
      const expirationTime = cooldowns.get(message.author.id);
      if (Date.now() < expirationTime) {
        const timeLeft = (expirationTime - Date.now()) / 1000;
        message.reply(`please wait ${timeLeft.toFixed(1)} more seconds before using the caseopen command again.`);
        return;
      }
    }

    // Get the number of cases to open from args (default to 1 if not provided)
    const numCases = args[0] ? parseInt(args[0]) : 1;
    const caseemoji = client.emojis.cache.get('1152495572696178709');

    // Set a cooldown for the user (adjust the cooldown time as needed)
    const cooldownTime = 1000; // 3 seconds
    cooldowns.set(message.author.id, Date.now() + cooldownTime);

    // Read the skins data from skins.json
    const skinsData = JSON.parse(fs.readFileSync(skinsFilePath, 'utf8'));

    // Logging 2: Add a log for reading skins.json
    // console.log('Read skins data from skins.json:');

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
        // Added log to debug the selectedSkin object
        console.log("Debugging selectedSkin object:", selectedSkin);
        const rarityName = selectedSkin.rarity.name;
        const skinIndex = userSkins.size + 1; // Calculate the skin index
        const skinTitle = `${selectedSkin.floatVal ? `(${getCondition(selectedSkin.floatVal)}) ` : ''}${selectedSkin.name}`;
        const skinColor = rarityColors[rarityName] || '#FFFFFF'; // Default to white if rarity is not found
        const collectionName = selectedSkin.collections[0].name; // Assuming there's only one collection per skin
        const weaponName = selectedSkin.weapon.name;



        embed.setTitle(skinTitle)
            .setDescription(`Collection: ${collectionName}\nWeapon: ${weaponName}\nSkin: ${selectedSkin.name}\nRarity: ${selectedSkin.rarity.name}\nStatTrak: ${selectedSkin.stattrak ? 'Yes' : 'No'}`)
            .setColor(skinColor);

        // Update the embed
        await msg.edit({ embeds: [embed] });

        // Logging 3: Add a log for successful skin insertion
        // console.log('Inserted selected skin into the database:', selectedSkin);

        // Save the selected skin to the database
        db.run(`INSERT INTO userSkins (isListed, UserID, name, description, weapon, weaponId, weaponName, categoryId, categoryName, patternId, patternName, min_float, max_float, rarityId, rarityName, stattrak, souvenir, paint_index, wears, collections, crates, image, caseCollection, skinName, rarity, isStatTrak, floatVal, condition) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [0,
           message.author.id,
           selectedSkin.name,
           selectedSkin.description,
           JSON.stringify(selectedSkin.weapon),
           selectedSkin.weapon.id,
           selectedSkin.weapon.name,
           selectedSkin.category.id,
           selectedSkin.category.name,
           selectedSkin.pattern.id,
           selectedSkin.pattern.name,
           selectedSkin.min_float,
           selectedSkin.max_float,
           selectedSkin.rarity.id,
           selectedSkin.rarity.name,
           selectedSkin.stattrak ? 1 : 0,
           selectedSkin.souvenir ? 1 : 0,
           selectedSkin.paint_index,
           JSON.stringify(selectedSkin.wears),
           JSON.stringify(selectedSkin.collections),
           JSON.stringify(selectedSkin.crates),
           selectedSkin.image,
           selectedSkin.collections[0]?.name || null,  // caseCollection
           selectedSkin.pattern.name || null,  // skinName
           JSON.stringify(selectedSkin.rarity),
           selectedSkin.stattrak ? 1 : 0,
           selectedSkin.floatVal,
           getCondition(selectedSkin.floatVal)], 
        function(err) {
         if (err) {
           console.error(err);
           return;
         }
         const skinIndex = this.lastID;  // Get the last inserted ID
         userSkins.set(skinIndex, selectedSkin);  // Store the user's skin with the unique id
       });

        // Inform the user that the skin has been added to their inventory
        message.reply(`You've unboxed: **${selectedSkin.name}!** It has been added to your inventory.`);
      } catch (error) {
        // Logging 4: Add a log for handling errors
        console.error('An error occurred:', error);
        message.channel.send('An error occurred while opening the case.');
      }
    }, 1000);
  }
};

// Function to get a random skin from the provided skinsData
function getRandomSkin(skinsData) {
    return new Promise((resolve, reject) => {
        try {
      // Define the rarity percentages
      const rarityPercentages = {
        'Mil-Spec Grade': { normal: 79.92, statTrak: 7.99 },
        'Restricted': { normal: 15.98, statTrak: 1.59 },
        'Classified': { normal: 3.2, statTrak: 0.32 },
        'Covert': { normal: 0.64, statTrak: 0.064 },
        'Extraordinary': { normal: 0.26, statTrak: 0.026 }
      };

      // Calculate the total percentage for normal and StatTrak skins
      let totalNormalPercentage = 0;
      let totalStatTrakPercentage = 0;
      for (const rarity in rarityPercentages) {
        totalNormalPercentage += rarityPercentages[rarity].normal;
        totalStatTrakPercentage += rarityPercentages[rarity].statTrak;
      }
  
      // Generate a random number between 0 and the total normal percentage
      const randomNum = Math.random() * totalNormalPercentage;
  
      // Determine the rarity based on the random number
      let cumulativeProbability = 0;
      let selectedRarity = null;
      let isStatTrak = false;
  
      for (const rarity in rarityPercentages) {
        cumulativeProbability += rarityPercentages[rarity].normal;
        if (randomNum < cumulativeProbability) {
          selectedRarity = rarity;
          break;
        }
      }
  
      // Filter skins from the provided data by the selected rarity
      const filteredSkins = skinsData.filter(skin => skin.rarity.name === selectedRarity);
  
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
        } catch (error) {
            console.error('An error occurred:', error);
            reject(error); // Handle the rejection here
        }
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