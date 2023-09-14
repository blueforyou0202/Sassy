module.exports = {
    name: 'warn',
    description: 'Warns a user with a reason.',
    async execute(message, args) {
        const member = message.mentions.members.first();
        const reason = args.slice(1).join(' ');
        if (!member) return message.reply('Please mention a user to warn.');
        if (!reason) return message.reply('Please provide a reason for the warning.');
        message.channel.send(`${member.user.tag} has been warned for: ${reason}`);
    },
};
