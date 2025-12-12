// Netlify serverless function wrapper for Express app
const serverless = require('serverless-http');

// Import your Express app (don't start the server)
const app = require('../../server');

// Export as serverless function
exports.handler = serverless(app);

