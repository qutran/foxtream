import WebSocket from 'ws';
import express from 'express';
import qs from 'qs';
import http from 'http';
import url from 'url';
import path from 'path';
import { open } from './open';

const TOOLS_PORT = 2789;

const wss = new WebSocket.Server({ noServer: true });

enum TYPE {
  APP = 'app',
  TOOLS = 'tools',
}

interface PoolInput {
  token: string;
  type: TYPE;
  connection: WebSocket;
}

const pools = {
  [TYPE.APP]: {},
  [TYPE.TOOLS]: {},
};

const app = express();
const server = http.createServer(app);

app.get('/ping', (req, res) => {
  res.sendStatus(200);
});

app.get('/ui', (req, res) => {
  res.sendFile(path.join(__dirname, '../view/ui.html'));
});

app.get('/client.mjs', (req, res) => {
  res.sendFile(path.join(__dirname, '../view/client.mjs'));
});

app.get('/open/:file', (req, res) => {
  const { file } = req.params;
  open(decodeURIComponent(file));
  res.sendStatus(200);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (connection, req) => {
  const { type, token } = qs.parse(url.parse(req.url).query);
  const receiver = type === TYPE.APP ? TYPE.TOOLS : TYPE.APP;
  addToPool({ token, type, connection });

  connection.on('message', message => {
    broadcast(receiver, token, message);
  });

  connection.on('close', () => {
    removeFromPool({ token, type, connection });
  });
});

function broadcast(to: TYPE, token: string, message: Object) {
  for (const connection of pools[to][token] || []) {
    connection.send(message);
  }
}

function addToPool({ token, type, connection }: PoolInput) {
  const pool = pools[type];
  if (!pool[token]) pool[token] = [];
  pool[token].push(connection);
}

function removeFromPool({ token, type, connection }: PoolInput) {
  const poolByToken = pools[type][token];
  poolByToken.splice(poolByToken.indexOf(connection, 1));
}

export function startToolsServer() {
  server.listen(TOOLS_PORT, () => {
    console.info(`TOOLS server started at ${TOOLS_PORT}`);
  });
}

startToolsServer();
