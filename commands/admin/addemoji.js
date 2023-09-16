const { Permissions } = require('discord.js');

module.exports = {
    name: 'addemoji',
    description: 'Add a custom emoji to the server using its ID.',
    usage: '<emoji_id>',
    args: true,
    permissions: 'MANAGE_EMOJIS', // Requires the "Manage Emojis" permission
    execute(message, args) {
        const emojiId = args[0];
        const emojiName = args[1] || 'custom_emoji'; // Default name if not provided

        // Check if the user has the "Manage Emojis" permission
        if (!message.member.permissions.has(this.permissions)) {
            return message.reply('You do not have permission to add emojis.');
        }

        // Check if the user has the admin role
        if (!checkAdminRole(message.guild.id, message.member)) {
            return message.reply('You do not have permission to use this admin command.');
        }

        // Fetch the emoji by ID
        message.guild.emojis
            .fetch(emojiId)
            .then((emoji) => {
                // Check if the emoji exists
                if (!emoji) {
                    return message.reply('Invalid emoji ID. Make sure to provide a valid emoji ID.');
                }

                // Create the emoji with the specified name and the emoji's URL
                message.guild.emojis
                    .create(emoji.url, emojiName)
                    .then((createdEmoji) => {
                        message.channel.send(`Emoji ${createdEmoji} has been added.`);
                    })
                    .catch((error) => {
                        console.error(error);
                        message.reply('An error occurred while adding the emoji.');
                    });
            })
            .catch((error) => {
                console.error(error);
                message.reply('An error occurred while fetching the emoji.');
            });
    },
};

// Function to check if the user has the admin role
function checkAdminRole(guildId, member) {
    // Implement logic to fetch the admin role for the given guild from your database
    // Return the admin role name or ID
}
