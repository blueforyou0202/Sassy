const db = require(`${global.__basedir}/database`); // Make sure to include the database

module.exports = {
  name: 'clear',
  description: 'Deletes a specified number of messages in the channel.',
  async execute(message, args) {
    // Check if the user has the admin role
    const hasAdminRole = await checkAdminRole(message.guild.id, message.member, message);

    if (!hasAdminRole) {
      return message.reply("You don't have permission to use this command.");
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount)) return message.reply('Please provide a valid number of messages to delete.');

    // Delete the messages
    await message.channel.bulkDelete(amount, true);

    // Send the confirmation message and delete it after 10 seconds
    const confirmationMessage = await message.channel.send(`Successfully deleted **${amount}** messages.`);
    setTimeout(() => {
      confirmationMessage.delete().catch(console.error);
    }, 10000); // Delete the confirmation message after 10 seconds
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
