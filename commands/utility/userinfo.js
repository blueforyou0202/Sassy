const { EmbedBuilder } = require('discord.js');
const path = require('path');
const configPath = path.join(__basedir, 'config.json');
const { prefix } = require(configPath);

module.exports = {
    name: 'userinfo',
    description: 'Get information about a user.',
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);

        // Initialize the embed
        const userInfoEmbed = new EmbedBuilder();

        // Set the color, title, and fields
        userInfoEmbed
            .setColor('#0099ff')  // Set the color
            .setTitle(`User Info: *${user.username}*`)  // Set the title
            .addFields(
            { name: 'User Tag', value: user.tag },
            { name: 'Is A Bot', value: user.bot.toString() },  // Convert boolean to string
            { name: 'Joined Server', value: new Date(member.joinedTimestamp).toLocaleDateString() },
            { name: 'Joined Discord', value: new Date(user.createdTimestamp).toLocaleDateString() },
            { name: 'Roles', value: member.roles.cache.map(role => role.toString()).join(' ,') }
        );


        // Send the embed
        message.channel.send({ embeds: [userInfoEmbed] });
    },
};