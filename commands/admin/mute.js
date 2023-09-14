const { Permissions } = require('discord.js');

module.exports = {
    name: 'mute',
    description: 'Mutes a user in all channels.',
    async execute(message, args, client) {
        console.log("Mute command triggered");
        const redx = client.emojis.cache.get('802793233192189983');

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
