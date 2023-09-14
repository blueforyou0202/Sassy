module.exports = {
    name: 'say',
    description: 'Makes the bot say a message.',
    execute(message, args) {
        if (args.length === 0) {
            return message.reply('**Usage: `!say <message>`**');
        }
        const sayMessage = args.join(' ');
        message.channel.send(sayMessage);
    },
};
