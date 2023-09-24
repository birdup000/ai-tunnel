const axios = require('axios');

const payload = {
  serverId: '1',
  payload: {
    sender: 'User',
    text: 'Hello',
    current: true,
    isCreatedByUser: true,
    parentMessageId: '00000000-0000-0000-0000-000000000000',
    conversationId: null,
    messageId: 'e595d44b-85d5-4528-bb36-248be36e0ae3',
    overrideParentMessageId: null,
    endpoint: 'openAI',
    model: 'gpt-4-0314',
    chatGptLabel: null,
    promptPrefix: null,
    temperature: 1,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    token: null
  }
};

axios.post('http://localhost:8000/v1/chat/completions', payload)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });