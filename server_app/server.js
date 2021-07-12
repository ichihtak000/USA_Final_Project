const PositionStatusHandler = require('./src/ws-handler/position-status.js');
const psHandler = new PositionStatusHandler();

const path = require("path");
const fastify = require("fastify")({
  logger: false
});

// Setup our static files
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});


fastify.register(require('fastify-websocket'))

fastify.get('/', { websocket: true }, (connection /* ScketStream */, req /* FastifyRequest */) => {
  attachConnectionId(connection.socket)
  
  connection.socket.on('message', (message) => {
    const responseBody = psHandler.positionStatusUpdate(message, connection.socket);
    // connection.socket.send(responseBody)
  })
  
  connection.socket.on('close', () => {
    psHandler.close(connection.socket.id)
  });
})

// Run the server and report out to the logs
fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});

function attachConnectionId(cn) {
  cn.ipAddress = cn._socket.remoteAddress.replace(/^.*:/g,'')
  cn.port = cn._socket.remotePort
  cn.unique = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  cn.id = `${cn.ipAddress}:${cn.port}:${cn.unique}`
}