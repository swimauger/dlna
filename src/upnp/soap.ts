import http, { IncomingMessage } from 'node:http';
import { CheerioAPI, load } from 'cheerio';

import ip from '../constants/ip.js';

export class SoapRequest {
  public static async from(request: IncomingMessage): Promise<SoapRequest> {
    const buffer = Buffer.concat(await request.toArray());
    const action: string = String(request.headers.soapaction);
    return new SoapRequest(action, load(buffer.toString()));
  }

  private constructor(
    public readonly action: string,
    public readonly body: CheerioAPI
  ) {}
}

const soap = http.createServer();

soap.listen(8080, function handleListening() {
  console.log('Listening at soap://%s:%d', ip, 8080);
});

export default soap;
