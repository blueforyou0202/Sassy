const db = require('../../database');

module.exports = {
  name: 'setadminrole',
  description: 'Sets the admin role for this server.',
  async execute(message, args) {
    if (message.author.id !== message.guild.ownerId) {
      return message.reply("You don't have permission to use this command.");
    }

    // Check if a role was mentioned
    if (!args[0]) {
      return message.reply("Please mention a role using '@RoleName'.");
    }

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

    // Delete the previous admin role from the database
    db.run("DELETE FROM server_roles WHERE server_id = ? AND permission_level = ?", [message.guild.id, 1], (err) => {
      if (err) {
        console.error('Error deleting previous admin role:', err.message);
        return message.reply("An error occurred while deleting the previous admin role.");
      }
      
      // Save the new admin role to the database
      db.run("INSERT INTO server_roles (server_id, role_name, role_id, permission_level) VALUES (?, ?, ?, ?)", [message.guild.id, role.name, role.id, 1], function(err) {
        if (err) {
          console.error('Error setting admin role:', err.message);
          return message.reply("An error occurred while setting the admin role.");
        }
        console.log(`Admin role set to ${role.name} in server ${message.guild.name}`);
        message.reply(`Admin role set to ${role.name}`);
      });
    });
  },
};

// // Function to check if the user has the admin role
// async function checkAdminRole(guildId, member, message) {
//   return new Promise((resolve, reject) => {
//     // Fetch the admin role from the database for the current server
//     db.get("SELECT * FROM server_roles WHERE server_id = ? AND permission_level = ?", [guildId, 1], (err, row) => {
//       if (err) {
//         console.error("Error fetching admin role:", err.message);
//         reject(err);
//       }

//       if (row) {
//         // Admin role found
//         // Check if the member has the admin role
//         const adminRole = message.guild.roles.cache.find(role => role.id === row.role_id);
//         if (adminRole && member.roles.cache.has(adminRole.id)) {
//           resolve(true); // User has the admin role
//         } else {
//           resolve(false); // User does not have the admin role
//         }
//       } else {
//         // Admin role not found
//         resolve(false); // User does not have the admin role
//       }
//     });
//   });
// }
