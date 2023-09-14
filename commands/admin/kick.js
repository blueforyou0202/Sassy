module.exports = {
    name: 'kick',
    description: 'Kicks a user from the server.',
    async execute(message, args) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('Please mention a user to kick.');
        await member.kick();
        message.channel.send(`${member.user.tag} has been kicked.`);
    },
};
