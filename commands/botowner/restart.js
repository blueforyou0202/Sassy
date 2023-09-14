const fs = require('fs');
const path = require('path');
const config = require(global.__basedir + '/config.json');

module.exports = {
    name: 'restart',
    description: 'Restarts the bot.',
    aliases: ['r'],
    execute(message, args, client) {
        console.log("Restart command recognized.");
        const crossemoji = client.emojis.cache.get('802793234349817887');

        // Construct the absolute path for restart.json
        const restartFilePath = path.join(global.__basedir, 'restart.json');
        
        // Store the channel ID to send the message to after restart
        const restartData = {
            userId: message.author.id,
            channelId: message.channel.id,
            time: Date.now()
        };

        // Log Restart Data Before Writing
        console.log("Preparing to write to restart.json:", restartData);
        
        try {
            fs.writeFileSync(restartFilePath, JSON.stringify(restartData));
            console.log("Wrote to restart.json.");
        } catch (err) {
            console.error('Error writing to restart.json:', err);
            message.channel.send('Error! Failed to prepare for restart.');
            return;
        }

        // Check if restart.json Exists Before Restarting
        if (fs.existsSync(restartFilePath)) {
            message.reply(`${crossemoji} Restarting the bot. Please be patient as this may take a second.`).then(() => {
                console.log("Waiting for file operations to complete...");
                setTimeout(() => {
                    console.log("Exiting process.");
                    process.exit(1);
                }, 1000);
            }).catch(err => {
                console.error("Error sending restart message:", err);
            });
        } else {
            console.error("Failed to write restart.json.");
            message.channel.send('Error! Failed to prepare for restart.');
        }
    },
};