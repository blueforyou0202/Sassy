const config = require('../config.json');
const db = require('../database');

module.exports = async (client, message) => {
    // Fetch custom prefix from database
    let prefix = config.prefix; // Default prefix
    const serverId = message.guild.id;

    await new Promise(resolve => {
        db.get('SELECT prefix FROM server_config WHERE server_id = ?', [serverId], (err, row) => {
            if (err) {
                console.error(err.message);
            } else if (row) {
                prefix = row.prefix;
            }
            resolve();
        });
    });

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

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
