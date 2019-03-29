const path         = require('path');
const express      = require('express');
const SocketServer = require('ws').Server;

const PORT = process.env.PORT || 8000;

const server = express()
.use(express.static('public'))
.listen(PORT, () => { console.log(`Listening on ${ PORT }`); });

let clientCount = 0;
const wss = new SocketServer({ server });
wss.on('connection', client => {
  let id = clientCount.toString().padStart(5, '0');
  console.log('connected', id);

  client.send(JSON.stringify({ address: '/id', value: id }));// set client id
  client.on('close', () => console.log('disconnected', id));

  client.on('message', m => {
    console.log(m);

    const data = JSON.parse(m);

    if(data.address === '/complete') {
      wss.clients.forEach(client => client.send(JSON.stringify({ address: '/complete' })));
    }
  });

  ++clientCount;
});