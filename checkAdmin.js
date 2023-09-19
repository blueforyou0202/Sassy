// checkAdmin.js
const db = require('./database');

const checkAdmin = (message, callback) => {
  db.get("SELECT role_id FROM server_roles WHERE server_id = ? AND permission_level = 1", [message.guild.id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return;
    }

    if (row && message.member.roles.cache.has(row.role_id)) {
      callback(true);  // User is an admin
    } else {
      callback(false); // User is not an admin
    }
  });
};

module.exports = checkAdmin;
