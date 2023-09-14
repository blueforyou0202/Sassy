const { EmbedBuilder } = require('discord.js');
const path = require('path');
const configPath = path.join(__basedir, 'config.json');
const { prefix } = require(configPath);

module.exports = {
    name: 'serverinfo',
    description: 'Shows information about the current server.',
    async execute(message) {
        const guild = message.guild;

        // Fetch the owner
        const owner = await guild.fetchOwner();

        // Initialize the embed
        const serverInfoEmbed = new EmbedBuilder();

        // Set the color, title, and fields
        serverInfoEmbed
            .setColor('#0099ff')
            .setTitle(`Server Info: *${guild.name}*`)
            .addFields(
                { name: 'Server Name', value: guild.name.toString() },
                { name: 'Server ID', value: guild.id.toString() },
                { name: 'Owner', value: owner ? owner.user.tag : 'Unknown' },
                { name: 'Region', value: guild.region ? guild.region.toString() : 'Automatic' },
                { name: 'Total Members', value: guild.memberCount.toString() },
                { name: 'Creation Date', value: new Date(guild.createdTimestamp).toLocaleDateString() },
                { name: 'Verification Level', value: guild.verificationLevel.toString() },
                { name: 'Boost Level', value: guild.premiumTier ? guild.premiumTier.toString() : '0' },
                { name: 'Boost Count', value: guild.premiumSubscriptionCount ? guild.premiumSubscriptionCount.toString() : '0' }
            );

        // Send the embed
        message.channel.send({ embeds: [serverInfoEmbed] });
    },
};