module.exports = {
    name: 'ping',
    description: 'Ping command',
    execute(message) {
        message.reply('Pong!');
    }
};
