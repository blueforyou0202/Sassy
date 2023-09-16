const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__basedir, 'config.json');
const { prefix } = require(configPath);
const db = require('../../database');

module.exports = {
    name: 'adminrolecommands',
    description: 'List admin commands available.',
    execute(message) {
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
                if (!message.member.roles.cache.some(role => role.id === adminRoleId)) {
                    return message.reply("You do not have the admin role to use this command.");
                }

                // Get a list of admin command files in the "Sassy\commands\admin" directory
                const adminCommandFiles = fs.readdirSync('./commands/admin').filter(file => file.endsWith('.js'));

                const adminCommands = adminCommandFiles.map(file => file.replace('.js', ''));

                // Create an EmbedBuilder instance for the admin commands
                const adminCommandEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Admin Commands')
                    .setDescription('Here are the available admin commands:')
                    .addFields({ name: 'Command List:', value: adminCommands.map(command => `${prefix}${command}`).join(', ') });

                // Send the EmbedBuilder message
                message.channel.send({ embeds: [adminCommandEmbed] });
            } else {
                // Admin role not found
                message.reply("No admin role set for this server.");
            }
        });
    },
};
