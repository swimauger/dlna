import process from 'node:process';

import router from './router.js';
import ssdp, { SsdpIncomingMessage, SsdpOutgoingMessage } from './upnp/ssdp.js';
import soap from './upnp/soap.js';
import { ip, uuid } from './constants/index.js';

soap.addListener('request', async function handleRequest(request, response) {
  if (request.method in router) {
    if (request.url in router[request.method]) {
      return router[request.method][request.url](request, response);
    }
  }
  console.log('%s %s', request.method, request.url);
  for await (const chunk of request) {
    process.stdout.write(chunk);
  }
  process.stdout.write('\n\n');
  response.writeHead(404);
  response.end('Not Found');
});

const MediaServerDiscoveryMessage = new SsdpOutgoingMessage({
  version: 'HTTP/1.1',
  statusCode: 200,
  reason: 'OK',
  headers: {
    'CACHE-CONTROL': 'no-store',
    'LOCATION': `http://${ip}:8080/description.xml`,
    'SERVER': `${process.title}/${process.versions.node} UPnP/1.1`,
    'ST': 'urn:schemas-upnp-org:device:MediaServer:1',
    'USN': `uuid:${uuid}::urn:schemas-upnp-org:device:MediaServer:1`
  }
});

ssdp.addListener('message', function handleMessage(message, rinfo) {
  const incomingMessage = new SsdpIncomingMessage(message);
  if (incomingMessage.method === 'M-SEARCH') {
    ssdp.send(MediaServerDiscoveryMessage.serialize(), rinfo.port, rinfo.address);
  }
});
