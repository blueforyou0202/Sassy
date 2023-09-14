const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'adminrolecommands',
    description: 'List admin commands available.',
    execute(message) {
        // Get a list of admin command files in the "Sassy\commands\admin" directory
        const adminCommandFiles = fs.readdirSync('./commands/admin').filter(file => file.endsWith('.js'));

        // Create an embed to list the admin commands
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Admin Commands')
            .setDescription('Here are the available admin commands:')
            .addField('Command List:', adminCommandFiles.map(file => `\`${file.replace('.js', '')}\``).join(', '));

        message.channel.send(embed);
    },
};
