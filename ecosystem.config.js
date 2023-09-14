module.exports = {
  apps : [
    {
      script: 'index.js',
      name: 'Sassy', // Your app's name
      watch: '.',
      autorestart: true,
      git: {
        repo: 'https://github.com/blueforyou0202/Sassy.git', // Replace with your repository URL
        path: '"C:\Users\dhga2\Desktop\Sassy"', // Replace with the path to your repository on your server
        hook: 'post-receive',
        command: 'npm install && pm2 reload all'
      }
    }
  ],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

