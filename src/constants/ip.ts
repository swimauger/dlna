import os from 'node:os';

export default Object.values(os.networkInterfaces()).flat().find(networkInterface =>
  networkInterface.family === 'IPv4' && !networkInterface.internal
)?.address ?? '127.0.0.1';
