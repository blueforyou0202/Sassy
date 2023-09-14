module.exports = {
    name: 'clear',
    description: 'Deletes a specified number of messages in the channel.',
    async execute(message, args) {
        const amount = parseInt(args[0]);
        if (isNaN(amount)) return message.reply('Please provide a valid number of messages to delete.');
        
        // Delete the messages
        await message.channel.bulkDelete(amount, true);
        
        // Send the confirmation message and delete it after 10 seconds
        message.channel.send(`Successfully deleted **${amount}** messages.`)
            
    },
};

