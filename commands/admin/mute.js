const { Permissions } = require('discord.js');

module.exports = {
    name: 'mute',
    description: 'Mutes a user in all channels.',
    async execute(message, args, client) {
        console.log("Mute command triggered");
        const redx = client.emojis.cache.get('802793233192189983');

        // Check if the user has the admin role
        const hasAdminRole = await checkAdminRole(message.guild.id, message.member, message);

        if (!hasAdminRole) {
            console.log("User does not have admin role");
            return message.reply(`${redx} **You don't have permission to use this command.**`);
        }

        const member = message.mentions.members.first();
        if (!member) {
            console.log("No member mentioned");
            return message.reply(`${redx} **Please mention a user to mute.**`);
        }

        console.log(`Attempting to mute ${member.user.tag}`);

        let muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');

        if (!muteRole) {
            console.log("Muted role does not exist. Creating one.");
            try {
                muteRole = await message.guild.roles.create({
                    name: 'Muted',
                    color: '#000000',
                    permissions: []
                });
                console.log("Muted role created");
            } catch (e) {
                console.log(`Failed to create Muted role. Error: ${e}`);
                return message.channel.send("Failed to create a 'Muted' role.");
            }
        } else {
            console.log("Muted role already exists");
        }

        message.guild.channels.cache.forEach(async (channel) => {
            try {
                await channel.permissionOverwrites.create(muteRole, {
                    SendMessages: false,
                    Speak: false,
                    AddReactions: false
                });
                console.log(`Set permissions for ${channel.name}`);
            } catch (e) {
                console.log(`Could not set permissions for ${channel.name}. Error: ${e.message}`);
            }
        });

        try {
            await member.roles.add(muteRole);
            console.log(`Successfully added Muted role to ${member.user.tag}`);
            message.channel.send(`:shushing_face: - **${member.user}** has been muted.`);
        } catch (e) {
            console.log(`Failed to add Muted role to ${member.user.tag}. Error: ${e}`);
            message.channel.send(`Failed to mute ${member.user.tag}.`);
        }
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
