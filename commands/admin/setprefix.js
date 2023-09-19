const db = require('../../database');

module.exports = {
  name: 'setprefix',
  description: 'Change the prefix for this server.',
  args: true,
  usage: '<new_prefix>',
  guildOnly: true,
  permissions: 'ADMINISTRATOR',
  async execute(message, args) {
    // Check if the user has the admin role
    const hasAdminRole = await checkAdminRole(message.guild.id, message.member, message);

    if (!hasAdminRole) {
      return message.reply("You don't have permission to use this command.");
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
