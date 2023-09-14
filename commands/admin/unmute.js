module.exports = {
    name: 'unmute',
    description: 'Unmutes a muted user.',
    async execute(message, args) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('Please mention a user to unmute.');

        const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
        if (!muteRole) return message.reply('Muted role does not exist.');

        await member.roles.remove(muteRole);
        message.channel.send(`${member.user} has been unmuted.`);
    },
};

