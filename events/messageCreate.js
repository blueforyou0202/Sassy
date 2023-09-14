const config = require('../config.json');

module.exports = (client, message) => {
    // Log every message the bot sees
    // console.log("Received message content:", message.content);

    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Here's where you check for the command or any of its aliases:
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    try {
        console.log(`Attempting to execute command: ${commandName}`);
        command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
};