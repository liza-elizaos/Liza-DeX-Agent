import { request } from 'http';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/balance',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

const body = JSON.stringify({
  userPublicKey: 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
});

req.write(body);
req.end();
