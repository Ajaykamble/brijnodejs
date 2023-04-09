const http=require('http');
const app=require('./app');
var fs = require('fs');
const port=process.env.port||3000;

const server=http.createServer(app);
var io = require('socket.io')(server,{
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
require('./chat')(io);
server.listen(port);
