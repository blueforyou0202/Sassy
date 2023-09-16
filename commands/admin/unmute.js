const { Permissions } = require('discord.js');

module.exports = {
  name: 'unmute',
  description: 'Unmutes a muted user.',
  async execute(message, args) {
    // Check if the user has the admin role or necessary permissions
    const isAdmin = message.member.roles.cache.some(role => role.name === 'Admin'); // Replace 'Admin' with your admin role name
    const hasPermission = message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES);

    if (!isAdmin && !hasPermission) {
      return message.reply('You do not have permission to unmute users.');
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply('Please mention a user to unmute.');

    const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (!muteRole) return message.reply('Muted role does not exist.');

    await member.roles.remove(muteRole);
    message.channel.send(`${member.user} has been unmuted.`);
  },
};
