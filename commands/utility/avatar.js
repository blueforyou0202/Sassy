const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Displays the avatar of a user.',
    async execute(message, args) {
        // Get the user mentioned or default to the message author
        const user = message.mentions.users.first() || message.author;

        // Initialize the embed
        const avatarEmbed = new EmbedBuilder();

        // Set the color, title, and image
        avatarEmbed
            .setColor('#0099ff')
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }));

        // Send the embed
        message.channel.send({ embeds: [avatarEmbed] });
    },
};
