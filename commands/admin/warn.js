module.exports = {
    name: 'warn',
    description: 'Warns a user with a reason.',
    async execute(message, args) {
      // Check if the user has the admin role or necessary permissions
      const isAdmin = message.member.roles.cache.some(role => role.name === 'Admin'); // Replace 'Admin' with your admin role name
      const hasPermission = message.member.permissions.has('MANAGE_MESSAGES'); // Change 'MANAGE_MESSAGES' to the desired permission if needed
  
      if (!isAdmin && !hasPermission) {
        return message.reply('You do not have permission to warn users.');
      }
  
      const member = message.mentions.members.first();
      const reason = args.slice(1).join(' ');
      if (!member) return message.reply('Please mention a user to warn.');
      if (!reason) return message.reply('Please provide a reason for the warning.');
      message.channel.send(`${member.user.tag} has been warned for: ${reason}`);
    },
  };
  