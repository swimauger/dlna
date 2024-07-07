import { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import edge from 'edge.js';

import { ip, uuid } from './constants/index.js';
import { SoapRequest } from './upnp/soap.js';
import services from './services.js';

edge.mount('default', path.resolve('resources'));

export default {
  'GET': {
    async '/description.xml'(_request: IncomingMessage, response: ServerResponse) {
      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/xml'
      });
      response.end(await edge.render('description', {
        uuid,
        ip,
        port: 8080,
        friendlyName: 'NodeJS Media Server',
        manufacturer: 'Mark Auger',
        manufacturerURL: 'https://swimauger.com'
      }));
    }
  },
  'POST': {
    async '/upnp/control/ContentDirectory'(request: IncomingMessage, response: ServerResponse) {
      const soapRequest = await SoapRequest.from(request);
      if (soapRequest.action in services) {
        return services[soapRequest.action](soapRequest, response);
      }
      response.writeHead(404);
      response.end('Not Found');
    },
    async '/upnp/event/ContentDirectory'(request: IncomingMessage, response: ServerResponse) {
      const soapRequest = await SoapRequest.from(request);
      if (soapRequest.action in services) {
        return services[soapRequest.action](soapRequest, response);
      }
      response.writeHead(404);
      response.end('Not Found');
    }
  }
}
