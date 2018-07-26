var Net             = require("net");
const isPortTaken = (port) => new Promise((resolve, reject) => {
    const tester = Net.createServer()
         .once('error', err => (err.code == 'EADDRINUSE' ? resolve(false) : reject(err)))
         .once('listening', () => tester.once('close', () => resolve(true)).close())
         .listen(port)
});
var port            = typeof(process.env.PORT) == 'string' ? process.env.PORT.toLowerCase() : 8080; // port
port                = Number(port)>0 ? port : 8080;
module.exports = port;

module.exports = {"f":isPortTaken,port};