const { EmbedBuilder } = require('discord.js');
const path = require('path');
const configPath = path.join(__basedir, 'config.json');
const { prefix } = require(configPath);

module.exports = {
    name: 'help',
    description: 'List all commands or info about a specific command.',
    aliases: ['commands'],
    usage: '[command name]',
    cooldown: 5,
    async execute(message, args) {
        const { commands } = message.client;

        if (!args.length) {
            // Sending help for all commands
            const helpEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Here are all of my commands:')
                .setDescription(commands.map(command => {
                    const aliases = command.aliases ? `(${prefix}${command.aliases.join(', ')})` : '';
                    return `${prefix}${command.name} ${aliases}: ${command.description}`;
                }).join('\n'));
                
            try {
                const dm = await message.author.createDM();
                await dm.send({ embeds: [helpEmbed] });
                if (message.channel.type !== 'dm') {
                    await message.reply('I\'ve sent you a DM with all my commands!');
                }
            } catch (error) {
                console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
            }
        } else {
            // Specific command help
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

            if (!command) {
                return message.reply('that\'s not a valid command!');
            }

            const commandHelpEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Command Help: ${command.name}`)
                .addField('Description', command.description);

            if (command.aliases) commandHelpEmbed.addField('Aliases', command.aliases.join(', '));
            if (command.usage) commandHelpEmbed.addField('Usage', `${prefix}${command.name} ${command.usage}`);
            commandHelpEmbed.addField('Cooldown', `${command.cooldown || 3} second(s)`);

            message.channel.send({ embeds: [commandHelpEmbed] });
        }
    },
};