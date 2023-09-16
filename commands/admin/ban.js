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
    // Fetch the admin role from the database for the current server
    const serverId = message.guild.id;
    const permissionLevel = 1; // You can adjust this if needed

    db.get("SELECT * FROM server_roles WHERE server_id = ? AND permission_level = ?", [serverId, permissionLevel], async (err, row) => {
      if (err) {
        logger.error("Error fetching admin role:", err.message);
        return message.reply("An error occurred while fetching the admin role.");
      }

      if (row) {
        // Admin role found
        const adminRoleId = row.role_id;

        // Check if the user sending the command has the admin role
        if (!message.member.roles.cache.some(role => role.id === adminRoleId)) {
          return message.reply("You do not have the admin role to use this command.");
        }

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
      } else {
        // Admin role not found
        message.reply("No admin role set for this server.");
      }
    });
  },
};
