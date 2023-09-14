// setadminrole.js
const db = require('../../database');

module.exports = {
  name: 'setadminrole',
  description: 'Sets the admin role for this server.',
  async execute(message, args) {
    // Check if the user is the server owner or an existing admin
    if (message.author.id !== message.guild.ownerId) {
      return message.reply("You don't have permission to set the admin role.");
    }

    // Get the role from the message and save it to the database
    const roleMention = args[0];
    const roleId = roleMention.replace(/<@&|>/g, '');
    const role = message.guild.roles.cache.get(roleId);

    if (!role) {
      return message.reply("Role not found.");
    }

    // Save to database
    db.run("INSERT INTO server_roles (server_id, role_name, role_id, permission_level) VALUES (?, ?, ?, ?)", [message.guild.id, role.name, role.id, 1], function(err) {
      if (err) {
        return message.reply("An error occurred while setting the admin role.");
      }
      message.reply(`Admin role set to ${role.name}`);
    });
  },
};
