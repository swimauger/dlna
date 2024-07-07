import { ServerResponse } from 'node:http';
import edge from 'edge.js';

import { SoapRequest } from './upnp/soap.js';
import gallery from '../resources/gallery.json' with { type: 'json' };

export default {
  async '"urn:schemas-upnp-org:service:ContentDirectory:1#GetSortCapabilities"'(
    _soapRequest: SoapRequest,
    response: ServerResponse
  ) {
    response.writeHead(200, {
      'Content-Type': 'application/xml, charset="utf-8"'
    });
    response.end(await edge.render('GetSortCapabilities'));
  },
  async '"urn:schemas-upnp-org:service:ContentDirectory:1#GetSearchCapabilities"'(
    _soapRequest: SoapRequest,
    response: ServerResponse
  ) {
    response.writeHead(200, {
      'Content-Type': 'application/xml, charset="utf-8"'
    });
    response.end(await edge.render('GetSearchCapabilities'));
  },
  async '"urn:schemas-upnp-org:service:ContentDirectory:1#Browse"'(
    _soapRequest: SoapRequest,
    response: ServerResponse
  ) {
    response.writeHead(200, {
      'Content-Type': 'application/xml, charset="utf-8"'
    });
    response.end(await edge.render('Browse', gallery));
  }
}
