const db = require(`${global.__basedir}/database`);
const { ownerID } = require(`${global.__basedir}/config.json`);

module.exports = {
  name: 'sqldel',
  description: 'Deletes all rows with NULL server_id from the actions table.',
  async execute(message, args) {
    // Check if the user is the owner
    if (message.author.id !== ownerID) {
      return message.reply('You do not have permission to use this command.');
    }

    // Execute the SQL DELETE command
    db.run("DELETE FROM actions WHERE server_id IS NULL", [], function(err) {
      if (err) {
        console.error(err.message);
        return message.reply('An error occurred while deleting the rows.');
      }

      // Inform the user how many rows were deleted
      message.reply(`Deleted ${this.changes} rows with NULL server_id from the actions table.`);
    });
  },
};
