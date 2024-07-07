import dgram from 'node:dgram';

import ip from '../constants/ip.js';

export interface SsdpMessageOptions {
  readonly headers?: Record<string, string>;
  readonly body?: Buffer;
  serialize(): Buffer;
}

export class SsdpMessage implements SsdpMessageOptions {
  public readonly headers: Record<string, string> = {};
  public readonly body: Buffer = Buffer.alloc(0);

  public constructor(options: Omit<SsdpMessageOptions, 'serialize'>);
  public constructor(buffer: Buffer);
  public constructor(dto: Omit<SsdpMessageOptions, 'serialize'> | Buffer) {
    if (Buffer.isBuffer(dto)) {
      let headersIndex = dto.indexOf('\r\n') + 2;
      while (dto.indexOf('\r\n', headersIndex) < dto.lastIndexOf('\r\n')) {
        const headerKeyIndex = dto.indexOf(': ', headersIndex) + 2;
        const headerKey = dto.subarray(headersIndex, headerKeyIndex - 2).toString();

        const headerValueIndex = dto.indexOf('\r\n', headerKeyIndex) + 2;
        const headerValue = dto.subarray(headerKeyIndex, headerValueIndex - 2).toString();

        this.headers[headerKey] = headerValue;
        headersIndex = headerValueIndex;
      }
      this.body = dto.subarray(dto.lastIndexOf('\r\n') + 2);
    } else {
      if (dto.headers) this.headers = dto.headers;
      if (dto.body) this.body = dto.body;
    }
  }

  public serialize(): Buffer {
    const chunks: Buffer[] = [];
    for (const [ key, value ] of Object.entries(this.headers)) {
      chunks.push(Buffer.from(key));
      chunks.push(Buffer.from(': '));
      chunks.push(Buffer.from(value));
      chunks.push(Buffer.from('\r\n'));
    }
    chunks.push(Buffer.from('\r\n'));
    chunks.push(Buffer.from(this.body));
    return Buffer.concat(chunks);
  }
}

export interface SsdpIncomingMessageOptions extends SsdpMessageOptions {
  readonly method: string;
  readonly path: string;
  readonly version: string;
}

export class SsdpIncomingMessage extends SsdpMessage implements SsdpIncomingMessageOptions {
  public readonly method: string;
  public readonly path: string;
  public readonly version: string;

  public constructor(options: Omit<SsdpIncomingMessageOptions, 'serialize'>);
  public constructor(buffer: Buffer);
  public constructor(dto: Omit<SsdpIncomingMessageOptions, 'serialize'> | Buffer) {
    if (Buffer.isBuffer(dto)) {
      super(dto);
      const pathIndex = dto.indexOf(' ') + 1;
      this.method = dto.subarray(0, pathIndex - 1).toString();

      const versionIndex = dto.indexOf(' ', pathIndex) + 1;
      this.path = dto.subarray(pathIndex, versionIndex - 1).toString();

      const headersIndex = dto.indexOf('\r\n', versionIndex) + 2;
      this.version = dto.subarray(versionIndex, headersIndex - 2).toString();
    } else {
      super(dto);
      this.method = dto.method;
      this.path = dto.path;
      this.version = dto.version;
    }
  }

  public serialize(): Buffer {
    const chunks: Buffer[] = [];
    chunks.push(Buffer.from(this.method));
    chunks.push(Buffer.from(' '));
    chunks.push(Buffer.from(this.path));
    chunks.push(Buffer.from(' '));
    chunks.push(Buffer.from(this.version));
    chunks.push(Buffer.from('\r\n'));
    chunks.push(super.serialize());
    return Buffer.concat(chunks);
  }
}

export interface SsdpOutgoingMessageOptions extends SsdpMessageOptions {
  readonly version: string;
  readonly statusCode: number;
  readonly reason: string;
}

export class SsdpOutgoingMessage extends SsdpMessage implements SsdpOutgoingMessageOptions {
  public readonly version: string;
  public readonly statusCode: number;
  public readonly reason: string;

  public constructor(options: Omit<SsdpOutgoingMessageOptions, 'serialize'>);
  public constructor(buffer: Buffer);
  public constructor(dto: Omit<SsdpOutgoingMessageOptions, 'serialize'> | Buffer) {
    if (Buffer.isBuffer(dto)) {
      super(dto);
      const versionIndex = dto.indexOf(' ') + 1;
      this.version = dto.subarray(0, versionIndex - 1).toString();

      const statusCodeIndex = dto.indexOf(' ', versionIndex) + 1;
      this.statusCode = parseInt(dto.subarray(versionIndex, statusCodeIndex - 1).toString());

      const reasonIndex = dto.indexOf('\r\n', statusCodeIndex) + 2;
      this.reason = dto.subarray(statusCodeIndex, reasonIndex - 2).toString();
    } else {
      super(dto);
      this.version = dto.version;
      this.statusCode = dto.statusCode;
      this.reason = dto.reason;
    }
  }

  public serialize(): Buffer {
    const chunks: Buffer[] = [];
    chunks.push(Buffer.from(this.version));
    chunks.push(Buffer.from(' '));
    chunks.push(Buffer.from(this.statusCode.toString()));
    chunks.push(Buffer.from(' '));
    chunks.push(Buffer.from(this.reason));
    chunks.push(Buffer.from('\r\n'));
    chunks.push(super.serialize());
    return Buffer.concat(chunks);
  }
}

const ssdp = dgram.createSocket('udp4');

ssdp.bind(1900, function handleListening() {
  console.log('Listening at ssdp://%s:%d', ip, 1900);
  ssdp.addMembership('239.255.255.250');
});

export default ssdp;
