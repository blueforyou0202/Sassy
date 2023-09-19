const { EmbedBuilder } = require('discord.js');
const { Pagination } = require('pagination.djs');
const sqlite3 = require('sqlite3').verbose();
const winston = require('winston');

let db = new sqlite3.Database('./dataBase.db');

const rarityColors = {
  'Mil-Spec Grade': '#4B69FF',
  'Restricted': '#8847FF',
  'Classified': '#D32CE6',
  'Covert': '#EB4B4B',
  'Extraordinary': '#E4AE33'
};

function normalizeRarity(rarity) {
  const rarityMapping = {
    'Mil-Spec Grade': 'Mil-Spec Grade',
    'Restricted': 'Restricted',
    'Classified': 'Classified',
    'Covert': 'Covert',
    'Extraordinary': 'Extraordinary'
  };

  return rarityMapping[rarity] || null;
}

function groupByRarity(rows) {
  const groups = {};
  rows.forEach(row => {
    const rarity = JSON.parse(row.rarity)?.name || 'Unknown';
    if (!groups[rarity]) {
      groups[rarity] = [];
    }
    groups[rarity].push(row);
  });
  return groups;
}

module.exports = {
  name: 'skins',
  description: 'Display all the skins you own',
  async execute(message, args, client) {
    // winston.info('Execute function triggered');

    db.all(`SELECT * FROM userSkins WHERE UserID = ? AND isListed = 0`, [message.author.id], async (err, rows) => {
      if (err) {
        winston.error(err);
        return;
      }
    //   winston.info('Database query successful');

      const groupedSkins = groupByRarity(rows);
      const sortedRarities = Object.keys(groupedSkins).sort((a, b) => Object.keys(rarityColors).indexOf(b) - Object.keys(rarityColors).indexOf(a));

      const embeds = [];

      sortedRarities.forEach(rarity => {
        let fieldsArray = [];
        const skins = groupedSkins[rarity];

        skins.forEach(row => {
          const weapon = (row.weapon)?.name || 'Unknown';
          const wearCondition = getCondition(row.floatVal);
          const statTrak = row.isStatTrak ? "StatTrak™ " : "";
          const title = `[Skin Index #${row.id}] (${wearCondition}) ${statTrak}${weapon} | ${row.skinName}`;
          const value = `Collection: ${row.caseCollection}\nWeapon: ${weapon}\nSkin: ${row.skinName}\nRarity: ${rarity}\nStatTrak: ${row.isStatTrak ? 'Yes' : 'No'}\nDescription: ${row.description}\nCategory: ${row.categoryName}\nPattern: ${row.patternName}\nMin Float: ${row.min_float}\nMax Float: ${row.max_float}`;
          fieldsArray.push({ name: title, value: value });
        });

        for (let j = 0; j < fieldsArray.length; j += 10) {
            const colorCode = rarityColors[rarity] ? rarityColors[rarity].substring(1) : "FFFFFF"; // Default to white
            embeds.push({ fields: fieldsArray.slice(j, j + 10), color: parseInt(colorCode, 16), author: { name: rarity } });
          }
      });

      const pagination = new Pagination(message, {
        limit: 1,
        idle: 30000,
      });

      try {
        pagination.setEmbeds(embeds);
        pagination.render();
        // winston.info('Pagination rendered');
      } catch (error) {
    //     winston.error('Failed to render pagination:', error);
       }
    });
  }
};

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