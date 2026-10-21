const serverless = require('serverless-http');
let handler;
exports.handler = async (event, context) => {
  if (!handler) {
    const { default: app } = await import('../../server/src/index.js');
    handler = serverless(app);
  }
  return handler(event, context);
};
