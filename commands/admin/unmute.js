const { Permissions } = require('discord.js');
const db = require('../../database'); // Make sure to include your database file

module.exports = {
  name: 'unmute',
  description: 'Unmutes a muted user.',
  async execute(message, args) {
    // Check if the user has the admin role
    const hasAdminRole = await checkAdminRole(message.guild.id, message.member, message);

    if (!hasAdminRole) {
      return message.reply("You don't have permission to use this command.");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply('Please mention a user to unmute.');

    const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (!muteRole) return message.reply('Muted role does not exist.');

    await member.roles.remove(muteRole);
    message.channel.send(`${member.user} has been unmuted.`);
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
