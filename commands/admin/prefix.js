const db = require('../../database');

module.exports = {
  name: 'prefix',
  description: 'Set a custom prefix for this server.',
  args: true,
  usage: '<new_prefix>',
  guildOnly: true,
  permissions: 'ADMINISTRATOR',
  execute(message, args) {
    const newPrefix = args[0];
    const serverId = message.guild.id;

    // Check if a prefix already exists for this server
    db.get('SELECT prefix FROM server_config WHERE server_id = ?', [serverId], (err, row) => {
      if (err) {
        console.error(err.message);
        return message.reply('An error occurred while setting the prefix.');
      }

      if (row) {
        // Update existing prefix
        db.run('UPDATE server_config SET prefix = ? WHERE server_id = ?', [newPrefix, serverId], function(err) {
          if (err) {
            console.error(err.message);
            return message.reply('An error occurred while updating the prefix.');
          }
          message.reply(`Prefix updated to ${newPrefix}`);
        });
      } else {
        // Insert new prefix
        db.run('INSERT INTO server_config (server_id, prefix) VALUES (?, ?)', [serverId, newPrefix], function(err) {
          if (err) {
            console.error(err.message);
            return message.reply('An error occurred while setting the prefix.');
          }
          message.reply(`Prefix set to ${newPrefix}`);
        });
      }
    });
  },
};
