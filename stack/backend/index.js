const fastify = require('fastify');
const axios = require('axios');
const fs = require('fs');

const app = fastify();

const serversData = fs.readFileSync('servers.json', 'utf-8');
let servers = serversData ? JSON.parse(serversData).servers : [];

app.register(require('@fastify/cors'));

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
        const serverData = fs.readFileSync('servers.json', 'utf-8');
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
        fs.writeFileSync('servers.json', JSON.stringify({ servers }));

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
            fs.writeFileSync('servers.json', JSON.stringify({ servers }));
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
        fs.writeFileSync('servers.json', JSON.stringify({ servers }));
        reply.send({ message: 'Server deleted successfully' });
    } catch (error) {
        reply.code(500).send(error);
    }
});

app.post('/v1/chat/completions', async (req, reply) => {
    const { serverId, payload } = req.body;

    try {
        const server = servers.find(server => server.id === serverId);

        if (!server) {
            throw new Error('Server not found');
        }

        const response = await axios.post(server.url, payload, {
            headers: server.headers,
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

app.listen(process.env.PORT, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening on ${address}`);
});
