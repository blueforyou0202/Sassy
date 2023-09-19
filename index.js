console.log("Bot is starting...");

global.__basedir = __dirname;
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const winston = require('winston');
const fs = require('fs');
const config = require('./config.json');
require('dotenv').config();
// Define and initialize userSkins map

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Setup logger
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(log => `[${log.timestamp}] [${log.level.toUpperCase()}] - ${log.message}`)
    ),
    transports: [
        new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) })
    ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Load commands
function loadCommands(directory) {
    // console.log(`Loading commands from directory: ${directory}`);
    const commandFiles = fs.readdirSync(directory).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const requirePath = `${directory}/${file}`;
        const command = require(requirePath);
        client.commands.set(command.name, command);
        console.log(`Loaded command: ${command.name}`);
    }

    // Load commands in subdirectories
    const subdirectories = fs.readdirSync(directory, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const subdirectory of subdirectories) {
        loadCommands(`${directory}/${subdirectory}`);
    }
}

loadCommands('./commands');
// console.log([...client.commands.keys()]); // Display loaded commands

// Load events
fs.readdir('./events/', (err, files) => {
    if (err) logger.error(err);
    console.log("Loading events...");
    files.forEach(file => {
        console.log(`Loading event: ${file}`);
        const event = require(`./events/${file}`);
        let eventName = file.split('.')[0];
        client.on(eventName, event.bind(null, client));
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
    logger.error('Unhandled promise rejection:', error);
});

client.login(config.token);

console.log("Bot setup complete.");
