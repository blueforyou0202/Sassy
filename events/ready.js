const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('video games & the Volcano');
    const checkemoji = client.emojis.cache.get('802793229996130347');

    // Construct the absolute path for restart.json
    const restartFilePath = path.join(__basedir, 'restart.json');
    
    // Check if the bot was restarted
    if (fs.existsSync(restartFilePath)) {
        console.log("Detected restart.json.");

        try {
            // Reading from the restart file
            const restartData = JSON.parse(fs.readFileSync(restartFilePath, 'utf8'));
            console.log('Read from restart.json:', restartData);

            const restartTime = restartData.time;
            const channelId = restartData.channelId;
            const userId = restartData.userId;  // Fetch the user's ID

            const now = Date.now();
            const duration = (now - restartTime) / 1000; // Convert to seconds

            const channel = client.channels.cache.get(channelId);
            if (channel) {
                console.log("Sending restart duration message.");

                // Fetch the user's message and reply to it
                channel.messages.fetch({ limit: 50 })  // Fetch the last 50 messages (or a number suitable for your needs)
                .then(messages => {
                    const userMessage = messages.find(msg => msg.author.id === userId && Date.now() - msg.createdTimestamp < 5000);  // Find the user's !restart message from the last 5 seconds (or adjust the time as necessary)
                    if (userMessage) {
                        userMessage.reply(`${checkemoji} Restart successful! It took approximately **${duration.toFixed(2)}** seconds!`);
                    } else {
                        channel.send(`${checkemoji} Restart successful! It took approximately **${duration.toFixed(2)}** seconds!`);  // Fallback in case we can't find the user's message
                    }
                }).catch(console.error);

            } else {
                console.warn("Channel not found.");
            }

            // Remove the restart file to avoid processing it again in future restarts
            fs.unlinkSync(restartFilePath);
        } catch (error) {
            console.error("Error processing restart.json:", error);
        }
    } else {
        console.log("restart.json not found.");
    }
};