const db = require('../../database');

module.exports = {
  name: 'adminrole',
  description: 'Check the current admin role for the server.',
  execute(message, args) {
    // Fetch the admin role from the database for the current server
    const serverId = message.guild.id;
    db.get("SELECT * FROM server_roles WHERE server_id = ? AND permission_level = ?", [serverId, 1], (err, row) => {
      if (err) {
        console.error("Error fetching admin role:", err.message);
        return message.reply("An error occurred while fetching the admin role.");
      }

      if (row) {
        // Admin role found
        message.reply(`The current admin role for this server is: ${row.role_name}`);
      } else {
        // Admin role not found
        message.reply("No admin role set for this server.");
      }
    });
  },
};
