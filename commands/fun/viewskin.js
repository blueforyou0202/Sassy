const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();


// Hex codes for skin rarity colors
const rarityColors = {
    'Mil-Spec Grade': '#4B69FF',
    'Restricted': '#8847FF',
    'Classified': '#D32CE6',
    'Covert': '#EB4B4B',
    'Extraordinary': '#E4AE33'
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
    async execute(message, args) {
        // Check if the user provided an argument
        if (!args[0]) {
            console.log('args[0] is null or undefined');
            message.reply('Please provide a skin index.');
            return;
        }

        console.log('Received args[0]:', args[0]);

        // Check if the argument is a valid integer
        const skinIndex = parseInt(args[0].replace('#', ''));
        if (isNaN(skinIndex) || skinIndex <= 0) {
            console.log('Invalid skin index:', args[0]);
            message.reply('Please provide a valid skin index.');
            return;
        }

        const userSkins = await getUserSkinsFromDatabase(message.author.id);

        //console.log('Executing !viewskin command');

        const selectedSkin = userSkins.find(skin => skin.id === skinIndex);

        if (!selectedSkin) {
            console.log('Skin not found:', skinIndex);
            message.reply('The specified skin index was not found.');
            return;
        }

        const rarityName = JSON.parse(selectedSkin.rarity).name;
        const embedColor = rarityColors[rarityName] || '#FFFFFF';

        const collectionValue = Array.isArray(selectedSkin.collections) && selectedSkin.collections.length > 0
              ? selectedSkin.collections.map(collection => collection.name).join(', ')
              : 'N/A';


        const embed = new EmbedBuilder()
            .setTitle(`[Skin Index #${selectedSkin.id}] (${getCondition(selectedSkin.floatVal)}) ${JSON.parse(selectedSkin.weapon).name} | ${selectedSkin.skinName}`)
            .addFields(
                { name: 'Collection', value: collectionValue },
                { name: 'Weapon', value: JSON.parse(selectedSkin.weapon).name },
                { name: 'Skin', value: selectedSkin.skinName },
                { name: 'Rarity', value: JSON.parse(selectedSkin.rarity).name },
                { name: 'StatTrak', value: selectedSkin.isStatTrak ? 'Yes' : 'No' },
                { name: 'Description', value: selectedSkin.description },
                { name: 'Category', value: selectedSkin.categoryName },
                { name: 'Pattern', value: selectedSkin.patternName },
                { name: 'Min Float', value: selectedSkin.min_float.toString() },
                { name: 'Max Float', value: selectedSkin.max_float.toString() },
                { name: 'Float Value', value: selectedSkin.floatVal ? selectedSkin.floatVal.toString() : 'N/A' }
            )
            .setColor(embedColor)
            .setImage(selectedSkin.image);

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
