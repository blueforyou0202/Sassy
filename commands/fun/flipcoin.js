module.exports = {
    name: 'flipcoin',
    description: 'Flips a coin and gives the result.',
    execute(message) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        message.channel.send(`Coin flip result: ${result}`);
    },
};
