const { Pagination } = require('pagination.djs');
const sqlite3 = require('sqlite3').verbose();
const winston = require('winston');
const fs = require('fs'); // Add this import for reading JSON files

let db = new sqlite3.Database('./dataBase.db');

const rarityColors = {
    'Mil-Spec Grade': '#4B69FF',
    'Restricted': '#8847FF',
    'Classified': '#D32CE6',
    'Covert': '#EB4B4B',
    'Extraordinary': '#E4AE33'
  };

module.exports = {
  name: 'skins',
  description: 'Display all the skins you own',
  async execute(message, args, client) {
    winston.info('Execute function triggered');

    db.all(`SELECT * FROM userSkins WHERE UserID = ?`, [message.author.id], async (err, rows) => {
        if (err) {
          winston.error(err);
          return;
        }
        winston.info('Database query successful');
  
        const embeds = [];
  
        let currentRarity = 'Mil-Spec Grade'; // Default to a valid rarity
        let fieldsArray = [];
  
        // Sort the rows by rarity in descending order
        const sortedRows = rows.sort((a, b) => Object.keys(rarityColors).indexOf(b.rarity) - Object.keys(rarityColors).indexOf(a.rarity));
  
        for (let i = 0; i < sortedRows.length; i++) {
            const row = sortedRows[i];
            const skinId = row.skinId; // Get the database ID of the skin

            const weapon = row.weapon?.name || 'Unknown';
            const rarity = normalizeRarity(row.rarity) || 'Unknown';

          
            // Function to normalize rarity value
        function normalizeRarity(rarity) {
            // Define a mapping of database rarity values to your defined keys
            const rarityMapping = {
            'Mil-Spec': 'Mil-Spec Grade',
            'Restricted': 'Restricted',
            'Classified': 'Classified',
            'Covert': 'Covert',
            'Rare Special Item': 'Extraordinary'
            };
        
            // Check if the rarity value exists in the mapping
            if (rarityMapping.hasOwnProperty(rarity)) {
            return rarityMapping[rarity];
            }
            return null; // Return null for unrecognized rarities
        }
          
          
      
        const wearCondition = getCondition(row.floatVal);
        const statTrak = row.isStatTrak ? "StatTrak™ " : "";
        const title = `(#${skinId}) (${wearCondition}) ${statTrak}${weapon} | ${row.skinName}`; // Use skinId as the index
        const value = `Collection: ${row.caseCollection}\nWeapon: ${weapon}\nSkin: ${row.skinName}\nRarity: ${rarity}\nStatTrak: ${row.isStatTrak ? 'Yes' : 'No'}\nDescription: ${row.description}\nCategory: ${row.categoryName}\nPattern: ${row.patternName}\nMin Float: ${row.min_float}\nMax Float: ${row.max_float}`;
        fieldsArray.push({ name: title, value: value });
      }

      if (fieldsArray.length > 0) {
        for (let j = 0; j < fieldsArray.length; j += 10) {
        embeds.push({ fields: fieldsArray.slice(j, j + 10), color: parseInt(rarityColors[currentRarity].substring(1), 16), author: { name: currentRarity } });
        }
      }

      const pagination = new Pagination(message, {
        limit: 1, // One embed per page
        idle: 30000, // idle time in ms before the pagination closes
      });

      try {
        pagination.setEmbeds(embeds);
        pagination.render();
        winston.info('Pagination rendered');
      } catch (error) {
        winston.error('Failed to render pagination:', error);
      }
    });
  }
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
