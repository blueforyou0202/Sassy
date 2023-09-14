const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'poll',
    description: 'Creates a poll with up to 5 options.',
    async execute(message, args) {
        const filter = m => m.author.id === message.author.id;
        message.reply('How many options will be in the poll? (Max 5)');
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
        const numOptions = parseInt(collected.first().content);
        
        if (isNaN(numOptions) || numOptions < 1 || numOptions > 5) {
            return message.reply('Invalid number of options. Must be between 1 and 5.');
        }

        const options = [];
        for (let i = 1; i <= numOptions; i++) {
            message.reply(`Please enter option ${i}:`);
            const collectedOption = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
            options.push(`${i}. ${collectedOption.first().content}`);
        }

        // Ask for the poll title
        message.reply('Please enter the title for your poll:');
        const collectedTitle = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
        const pollTitle = collectedTitle.first().content;

        const pollEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(pollTitle)  // Use the user-provided title
            .setDescription(options.join('\n'));

        const pollMessage = await message.channel.send({ embeds: [pollEmbed] });

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
        for (let i = 0; i < numOptions; i++) {
            await pollMessage.react(emojis[i]);
        }
    },
};

