module.exports = {
    name: 'random',
    description: 'Generates a random number within a range.',
    execute(message, args) {
        if (args.length < 2) {
            return message.reply('You must provide a minimum and maximum number.');
        }
        const min = parseInt(args[0]);
        const max = parseInt(args[1]);
        if (isNaN(min) || isNaN(max)) {
            return message.reply('Both the minimum and maximum must be valid numbers.');
        }
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        message.channel.send(`Random number between ${min} and ${max}: ${randomNumber}`);
    },
};
