module.exports = {
  apps : [{
    script: 'ts-node',
    args: 'index.ts',
    env_production: {
      NODE_ENV: "production"
   },
  }],
  deploy: {
    production : {
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
    }
  }
};