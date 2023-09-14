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

    // Get the role mention from the message
    const roleMention = args[0];
    
    // Check if the role mention is in the correct format
    const roleMatch = roleMention.match(/^<@&(\d+)>$/);
    if (!roleMatch) {
      console.error('Invalid role mention format:', roleMention);
      return message.reply("Invalid role mention format. Please mention a role using '@RoleName'.");
    }

    // Extract the role ID from the match
    const roleId = roleMatch[1];
    const role = message.guild.roles.cache.get(roleId);

    if (!role) {
      console.error('Role not found:', roleId);
      return message.reply("Role not found.");
    }

    // Save to database
    db.run("INSERT INTO server_roles (server_id, role_name, role_id, permission_level) VALUES (?, ?, ?, ?)", [message.guild.id, role.name, role.id, 1], function(err) {
      if (err) {
        console.error('Error setting admin role:', err.message);
        return message.reply("An error occurred while setting the admin role.");
      }
      console.log(`Admin role set to ${role.name} in server ${message.guild.name}`);
      message.reply(`Admin role set to ${role.name}`);
    });
  },
};
