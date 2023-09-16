const db = require('../../database');

module.exports = {
  name: 'adminrole',
  description: 'Check the current admin role for the server.',
  execute(message, args) {
    // Fetch the admin role from the database for the current server
    const serverId = message.guild.id;
    const permissionLevel = 1; // You can adjust this if needed

    db.get("SELECT * FROM server_roles WHERE server_id = ? AND permission_level = ?", [serverId, permissionLevel], (err, row) => {
      if (err) {
        console.error("Error fetching admin role:", err.message);
        return message.reply("An error occurred while fetching the admin role.");
      }

      if (row) {
        // Admin role found
        const adminRoleId = row.role_id;

        // Check if the user sending the command has the admin role
        if (message.member.roles.cache.some(role => role.id === adminRoleId)) {
          message.reply(`The current admin role for this server is: <@&${adminRoleId}>`);
        } else {
          message.reply("You do not have the admin role to use this command.");
        }
      } else {
        // Admin role not found
        message.reply("No admin role set for this server.");
      }
    });
  },
};

