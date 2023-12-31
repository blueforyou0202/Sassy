const { EmbedBuilder } = require('discord.js');
const db = require(`${global.__basedir}/database`);
const winston = require('winston');

// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = {
  name: 'bans',
  description: 'Displays all bans from the database.',
  async execute(message, args) {
    // Check if the user has the admin role
    const hasAdminRole = await checkAdminRole(message.guild.id, message.member, message);

    if (!hasAdminRole) {
      return message.reply("You don't have permission to use this command.");
    }

    logger.info(`Fetching bans for server ID: ${message.guild.id}`);
    
    // Fetch all ban records from the database for this server
    db.all("SELECT * FROM actions WHERE action = 'ban' AND server_id = ?", [message.guild.id], async (err, rows) => {
      if (err) {
        logger.error(err.message);
        return;
      }

      logger.info(`Fetched ${rows.length} bans.`);

      const bansEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('List of Bans')
        .setDescription('Here are the bans for this server.');

      const fields = await Promise.all(rows.map(async row => {
        const user = await message.client.users.fetch(row.user_id).catch(() => null);
        const mod = await message.client.users.fetch(row.moderator_id).catch(() => null);
        
        const userName = user ? `${user.username}#${user.discriminator}` : 'Unknown User';
        const modName = mod ? `${mod.username}#${mod.discriminator}` : 'Unknown Mod';

        // Convert and format the timestamp to Brisbane time
        const date = new Date(row.timestamp);
        const brisbaneTime = date.toLocaleString('en-AU', { timeZone: 'Australia/Brisbane', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

        return {
          name: `User: ${userName} (${row.user_id})`,
          value: `Moderator: ${modName} (${row.moderator_id})\nTimestamp: ${brisbaneTime}`
        };
      }));

      bansEmbed.addFields(fields);

      message.channel.send({ embeds: [bansEmbed] });
    });
  },
};

// Function to check if the user has the admin role
async function checkAdminRole(guildId, member, message) {
  return new Promise((resolve, reject) => {
    // Fetch the admin role from the database for the current server
    db.get("SELECT * FROM server_roles WHERE server_id = ? AND permission_level = ?", [guildId, 1], (err, row) => {
      if (err) {
        console.error("Error fetching admin role:", err.message);
        reject(err);
      }

      if (row) {
        // Admin role found
        // Check if the member has the admin role
        const adminRole = message.guild.roles.cache.find(role => role.id === row.role_id);
        if (adminRole && member.roles.cache.has(adminRole.id)) {
          resolve(true); // User has the admin role
        } else {
          resolve(false); // User does not have the admin role
        }
      } else {
        // Admin role not found
        resolve(false); // User does not have the admin role
      }
    });
  });
}
