module.exports = {
  apps: [
    {
      name: 'gift-tournament-web',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5173
      }
    },
    {
      name: 'gift-tournament-gifts',
      script: 'start-production.cjs',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: '127.0.0.1',
      ref: 'origin/main',
      repo: 'https://github.com/SOLEIIL/gift-tournament.git',
      path: '/var/www/gift-tournament',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
