const db = require(`${global.__basedir}/database`);
const winston = require('winston');

// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = {
  name: 'ban',
  description: 'Bans a user from the server.',
  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) {
      logger.warn('No user mentioned to ban.');
      return message.reply('Please mention a user to ban.');
    }

    await member.ban().catch(err => {
      logger.error(`Failed to ban user: ${err}`);
      return message.reply('Failed to ban the user.');
    });

    message.channel.send(`${member.user.tag} has been banned.`);
    logger.info(`Banned user ${member.user.tag}`);

    // Log to database
    db.run(`INSERT INTO actions (action, user_id, moderator_id, server_id) VALUES (?, ?, ?, ?)`, 
           ['ban', member.id, message.author.id, message.guild.id], function(err) {
      if (err) {
        logger.error(`Failed to log ban to database: ${err}`);
      } else {
        logger.info(`Logged ban to database. Row ID: ${this.lastID}`);
      }
    });
  },
};

