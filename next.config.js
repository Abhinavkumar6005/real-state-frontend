const api = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
module.exports = {
  images: { remotePatterns: [{ protocol: api.protocol.replace(':', ''), hostname: api.hostname, port: api.port || '' }] },
};
