const { EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  name: 'warns',
  description: 'Displays all warns on the server.',
  async execute(message, args) {
    // Check if the user has the admin role or necessary permissions
    const isAdmin = message.member.roles.cache.some(role => role.name === 'Admin'); // Replace 'Admin' with your admin role name
    const hasPermission = message.member.permissions.has('MANAGE_MESSAGES'); // Change 'MANAGE_MESSAGES' to the desired permission if needed

    if (!isAdmin && !hasPermission) {
      return message.reply('You do not have permission to view warns.');
    }

    // Fetch all warn records from the database for this server
    db.all("SELECT * FROM warns WHERE server_id = ?", [message.guild.id], async (err, rows) => {
      if (err) {
        console.error(err.message);
        return;
      }

      const warnsEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('List of Warns')
        .setDescription('Here are the warns for this server:');

      const fields = await Promise.all(rows.map(async row => {
        const user = await message.client.users.fetch(row.user_id).catch(() => null);
        const mod = await message.client.users.fetch(row.moderator_id).catch(() => null);

        const userName = user ? `${user.username}#${user.discriminator}` : 'Unknown User';
        const modName = mod ? `${mod.username}#${mod.discriminator}` : 'Unknown Mod';

        // Convert and format the timestamp to Brisbane time
        const date = new Date(row.timestamp);
        const brisbaneTime = date.toLocaleString('en-AU', {
          timeZone: 'Australia/Brisbane',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });

        return {
          name: `User: ${userName} (${row.user_id})`,
          value: `Moderator: ${modName} (${row.moderator_id})\nReason: ${row.reason}\nTimestamp: ${brisbaneTime}`,
        };
      }));

      warnsEmbed.addFields(fields);

      message.channel.send({ embeds: [warnsEmbed.build()] });
    });
  },
};
