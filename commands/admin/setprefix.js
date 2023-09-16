const db = require('../../database');

module.exports = {
  name: 'setprefix',
  description: 'Change the prefix for this server.',
  args: true,
  usage: '<new_prefix>',
  guildOnly: true,
  permissions: 'ADMINISTRATOR',
  async execute(message, args) {
    // Check if the user is the server owner or an existing admin
    if (message.author.id !== message.guild.ownerId) {
      return message.reply("You don't have permission to change the prefix.");
    }

    const newPrefix = args[0];
    const serverId = message.guild.id;

    if (!newPrefix) {
      return message.reply('Please provide a valid prefix.');
    }

    db.get('SELECT prefix FROM server_config WHERE server_id = ?', [serverId], (err, row) => {
      if (err) {
        console.error(err.message);
        return message.reply('An error occurred while setting the prefix.');
      }

      if (row) {
        db.run('UPDATE server_config SET prefix = ? WHERE server_id = ?', [newPrefix, serverId], function(err) {
          if (err) {
            console.error(err.message);
            return message.reply('An error occurred while updating the prefix.');
          }
          message.reply(`Prefix updated to \`${newPrefix}\``);
        });
      } else {
        db.run('INSERT INTO server_config (server_id, prefix) VALUES (?, ?)', [serverId, newPrefix], function(err) {
          if (err) {
            console.error(err.message);
            return message.reply('An error occurred while setting the prefix.');
          }
          message.reply(`Prefix set to \`${newPrefix}\``);
        });
      }
    });
  },
};
