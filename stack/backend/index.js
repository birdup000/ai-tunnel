const fastify = require('fastify');
const axios = require('axios');
const fs = require('fs');

const app = fastify();

const serversData = fs.readFileSync('data/servers.json', 'utf-8');
let servers = serversData ? JSON.parse(serversData).servers : [];

app.register(require('@fastify/cors'));

app.addHook('preHandler', (req, reply, done) => {
  if (req.url.startsWith('/v1/chat/completions')) {
    if (servers.length === 0) {
      reply.code(500).send({ message: 'No servers available' });
    } else {
      let currentIndex = servers.findIndex(server => server.lastUsed);
      if (currentIndex === -1) {
        currentIndex = 0;
      }
      const selectedServer = servers[currentIndex];
      req.selectedServer = selectedServer;
      currentIndex = (currentIndex + 1) % servers.length;
      servers[currentIndex].lastUsed = true;
      servers.forEach(server => {
        if (server !== servers[currentIndex]) {
          server.lastUsed = false;
        }
      });
    }
  }
  done();
});

app.get('/servers', async (req, reply) => {
  try {
    reply.send({ servers });
  } catch (error) {
    reply.code(500).send(error);
  }
});

app.get('/servers/:id', async (req, reply) => {
  const { id } = req.params;
  try {
    const server = servers.find(server => server.id === id);
    if (!server) {
      reply.code(404).send({ message: 'Server not found' });
    } else {
      const serverData = fs.readFileSync('data/servers.json', 'utf-8');
      const serverJson = JSON.parse(serverData);
      const selectedServer = serverJson.servers.find(server => server.id === id);
      reply.send({ server: selectedServer });
    }
  } catch (error) {
    reply.code(500).send(error);
  }
});

app.post('/servers', async (req, reply) => {
  const { name, url, headers, curlRequest } = req.body;

  try {
    const newServer = {
      id: String(Date.now()),
      name,
      code: curlRequest || '',
      url,
      headers,
    };

    servers.push(newServer);
    fs.writeFileSync('data/servers.json', JSON.stringify({ servers }));

    reply.send({ server: newServer });
  } catch (error) {
    reply.code(500).send(error);
  }
});

app.put('/servers/:id', async (req, reply) => {
  const { id } = req.params;
  const { code } = req.body;

  try {
    const server = servers.find(server => server.id === id);

    if (!server) {
      reply.code(404).send({ message: 'Server not found' });
    } else {
      server.code = code;
      server.lastUsed = Date.now();
      fs.writeFileSync('data/servers.json', JSON.stringify({ servers }));
      reply.send({ server });
    }
  } catch (error) {
    reply.code(500).send(error);
  }
});

app.delete('/servers/:id', async (req, reply) => {
  const { id } = req.params;

  try {
    servers = servers.filter(server => server.id !== id);
    fs.writeFileSync('data/servers.json', JSON.stringify({ servers }));
    reply.send({ message: 'Server deleted successfully' });
  } catch (error) {
    reply.code(500).send(error);
  }
});

app.post('/v1/chat/completions', async (req, reply) => {
  const { payload } = req.body;

  try {
    const selectedServer = req.selectedServer;

    const response = await axios.post(selectedServer.url, payload, {
      headers: selectedServer.headers,
    });

    reply.send(response.data);
  } catch (error) {
    reply.code(500).send(error);
  }
});

app.post('/curl', async (req, reply) => {
  const { request } = req.body;

  try {
    const response = await axios(request);
    reply.send(response.data);
  } catch (error) {
    reply.code(500).send(error);
  }
});

app.listen({ port: process.env.PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});