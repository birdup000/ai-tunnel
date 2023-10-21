const fastify = require('fastify');
const axios = require('axios');
const fs = require('fs');
const stream = require('stream');
const { createLogger, transports } = require('winston');

const app = fastify();

const logger = createLogger({
  transports: [
    new transports.File({ filename: 'error.log' }),
    new transports.Console()
  ]
});

const serversData = fs.readFileSync('data/servers.json', 'utf-8');
let servers = serversData ? JSON.parse(serversData).servers : [];

app.register(require('@fastify/cors'));

app.addHook('preHandler', (req, reply, done) => {
  if (req.url.startsWith('/v1/chat/completions')) {
    if (servers.length === 0) {
      reply.code(500).send({ message: 'No servers available' });
      logger.error('No servers available');
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
    logger.error(`Error getting servers: ${error}`);
  }
});

app.get('/servers/:id', async (req, reply) => {
  const { id } = req.params;
  try {
    const server = servers.find(server => server.id === id);
    if (!server) {
      reply.code(404).send({ message: 'Server not found' });
      logger.error('Server not found');
    } else {
      const serverData = fs.readFileSync('data/servers.json', 'utf-8');
      const serverJson = JSON.parse(serverData);
      const selectedServer = serverJson.servers.find(server => server.id === id);
      reply.send({ server: selectedServer });
    }
  } catch (error) {
    reply.code(500).send(error);
    logger.error(`Error getting server: ${error}`);
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
    logger.error(`Error adding server: ${error}`);
  }
});

app.put('/servers/:id', async (req, reply) => {
  const { id } = req.params;
  const { code } = req.body;

  try {
    const server = servers.find(server => server.id === id);

    if (!server) {
      reply.code(404).send({ message: 'Server not found' });
      logger.error('Server not found');
    } else {
      server.code = code;
      server.lastUsed = Date.now();
      fs.writeFileSync('data/servers.json', JSON.stringify({ servers }));
      reply.send({ server });
    }
  } catch (error) {
    reply.code(500).send(error);
    logger.error(`Error updating server: ${error}`);
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
    logger.error(`Error deleting server: ${error}`);
  }
});

app.post('/v1/chat/completions', async (req, reply) => {
  const { payload } = req.body;

  try {
    const selectedServer = req.selectedServer;

    const responseMessage = await instructChatCompletion(selectedServer, payload);

    const response = {
      id: generateId(),
      object: "chat.completion",
      created: Math.floor(new Date() / 1000),
      model: payload.model,
      choices: [
        {
          message: {
            role: "assistant",
            content: responseMessage.choices[0].content,
          },
          finish_reason: "stop",
        },
      ],
    };

    if (payload.stream) {
      reply
        .type("text/event-stream")
        .send(`data: ${JSON.stringify(response)}\n\n`);

      const words = responseMessage.choices[0].content.split(" ");
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i !== words.length - 1 ? " " : "");
        const chunk = {
          id: response.id,
          object: response.object,
          created: response.created,
          model: response.model,
          choices: [
            {
              delta: { role: "assistant", content: word },
              finish_reason: null,
            },
          ],
        };
        reply.send(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      const doneChunk = {
        id: response.id,
        object: response.object,
        created: response.created,
        model: response.model,
        choices: [
          {
            delta: {},
            finish_reason: "stop",
          },
        ],
      };
      reply.send(`data: ${JSON.stringify(doneChunk)}\n\n`);
      reply.send('data: [DONE]\n\n');
    } else {
      reply.send(response);
    }
  } catch (error) {
    reply.code(500).send(error);
    logger.error(`Error with chat completions: ${error}`);
  }
});

app.post('/curl', async (req, reply) => {
  const { request } = req.body;

  try {
    const response = await axios(request);
    reply.send(response.data);
  } catch (error) {
    reply.code(500).send(error);
    logger.error(`Error with Curl request: ${error}`);
  }
});

app.listen({ port: process.env.PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    logger.error(`Error starting server: ${err}`);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
  logger.info(`Server listening on ${address}`);
});

async function instructChatCompletion(server, payload) {
  const serverPayload = {
    sender: "User",
    text: payload.content,
    current: true,
    isCreatedByUser: true,
    parentMessageId: "00000000-0000-0000-0000-000000000000",
    conversationId: null,
    messageId: generateId(),
    overrideParentMessageId: null,
    endpoint: "openAI",
    model: payload.model,
    chatGptLabel: null,
    promptPrefix: null,
    temperature: 1,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    token: null
  };

  const response = await axios.post(server.url, {
    serverId: server.id,
    payload: serverPayload
  }, { headers: server.headers });

  return {
    choices: [
      {
        content: response.data.message.content
      }
    ]
  };
}

function generateId() {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 29; i++) {
    randomPart += characters[Math.floor(Math.random() * characters.length)];
  }
  return `chatcmpl-${randomPart}`;
}
