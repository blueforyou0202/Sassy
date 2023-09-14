const axios = require('axios');
const Discord = require('discord.js');
const Bottleneck = require('bottleneck');
const NodeCache = require('node-cache');
const path = require('path');
const configPath = path.join(__basedir, 'config.json');
const config = require(configPath);

const limiter = new Bottleneck({
  minTime: 200 // 5 requests per second
});

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

module.exports = {
  name: 'csgoinventory',
  description: 'Get the total value of a CS:GO inventory.',
  aliases: ['csinv'],
  async execute(message, args, client) {
    console.log(`Debug: args is ${JSON.stringify(args)}`);
    if (!args[0]) {
      return message.channel.send('Please provide a SteamID or Steam profile URL.');
    }

    const steamID = args[0];
    console.log(`Debug: steamID is ${steamID}`);  // Debug log

    try {
      let totalValue = 0;

      // Check cache first
      console.log(`Debug: Checking cache for ${steamID}`);  // Debug log
      const cachedValue = cache.get(steamID);
      if (cachedValue) {
        totalValue = cachedValue;
      } else {
        await limiter.schedule(async () => {
          console.log(`Debug: Fetching inventory for ${steamID}`);  // Debug log
          const inventoryResponse = await axios.get(`http://api.steampowered.com/IEconItems_730/GetPlayerItems/v0001/?key=${config.apikey}&SteamID=${steamID}`);
          console.log(`Debug: Inventory response: ${JSON.stringify(inventoryResponse.data)}`);  // Debug log

          const items = inventoryResponse.data.result.items;

          for (const item of items) {
            console.log(`Debug: Fetching market price for item ${item.market_hash_name}`);  // Debug log
            const marketPriceResponse = await axios.get(`http://api.steampowered.com/ISteamEconomy/GetMarketPrice/v1/?key=${config.apikey}&appid=730&currency=1&market_hash_name=${item.market_hash_name}`);
            console.log(`Debug: Market price response: ${JSON.stringify(marketPriceResponse.data)}`);  // Debug log

            totalValue += marketPriceResponse.data.result.price;
          }
        });

        // Cache the total value
        cache.set(steamID, totalValue);
      }

      const embed = new Discord.MessageEmbed()
        .setTitle('CS:GO Inventory Value')
        .setDescription(`Total value of the inventory: $${totalValue.toFixed(2)}`)
        .setColor('#0099ff');
      message.channel.send(embed);

    } catch (error) {
      console.error('Error fetching inventory:', error);
      message.channel.send('An error occurred while fetching the inventory.');
    }
  }
};
