const db = require('../../database');

module.exports = {
  name: 'prefix',
  description: 'Display the current prefix for this server.',
  guildOnly: true,
  execute(message) {
    const serverId = message.guild.id;

    db.get('SELECT prefix FROM server_config WHERE server_id = ?', [serverId], (err, row) => {
      if (err) {
        console.error(err.message);
        return message.reply('An error occurred while fetching the prefix.');
      }

      const currentPrefix = row ? row.prefix : '!';
      message.reply(`The current prefix for this server is: \`${currentPrefix}\``);
    });
  },
};
