import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const SidebarContainer = styled.div`
  width: 300px;
  background-color: #191e34;
  padding: 20px;
`;

const SidebarHeading = styled.h1`
  color: #ffffff;
  font-size: 24px;
  margin-bottom: 20px;
`;

const SidebarList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SidebarListItem = styled.li`
  color: #ffffff;
  font-size: 18px;
  margin-bottom: 10px;
  cursor: pointer;

  &:hover {
    color: #ffac00;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 30px;
`;

const SectionHeading = styled.h2`
  margin-bottom: 20px;
  font-size: 22px;
  color: #333;
`;

const ServerListContainer = styled.div`
  margin-bottom: 30px;
`;

const ServerItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  input {
    margin-right: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }

  textarea {
    margin-top: 8px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    resize: vertical;
  }
`;

const ServerCodeContainer = styled.div`
  margin-bottom: 10px;

  pre {
    font-family: "Courier New", monospace;
    background-color: #f5f5f5;
    padding: 10px;
    font-size: 14px;
    color: #333;
  }
  
  textarea {
    margin-top: 8px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    resize: vertical;
  }
`;

const ServerCode = styled.code`
  font-family: "Courier New", monospace;
  background-color: #f5f5f5;
  padding: 10px;
  display: block;
  white-space: pre-wrap;
  font-size: 14px;
  color: #333;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  height: 200px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  padding: 10px;
  font-family: "Courier New", monospace;
  color: #333;
  font-size: 14px;
`;

const Select = styled.select`
  margin-right: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
  background-color: #fff;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

function Panel() {
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState("");
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo-16k");
  const [response, setResponse] = useState("");
  const [newServerName, setNewServerName] = useState("");
  const [curlRequest, setCurlRequest] = useState("");

  useEffect(() => {
    fetchServerList();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/v1/chat/events");

    eventSource.addEventListener("message", messageHandler);

    return () => {
      eventSource.removeEventListener("message", messageHandler);
      eventSource.close();
    };
  }, []);

  const fetchServerList = async () => {
    try {
      const response = await axios.get("http://localhost:8000/servers");
      setServers(response.data.servers);
    } catch (error) {
      console.error(error);
    }
  };

  const addServer = async () => {
    try {
      const response = await axios.post("http://localhost:8000/servers", {
        name: newServerName,
        code: curlRequest,
        headers: {},
      });
      setServers(prevServers => [...prevServers, response.data.server]);
      setNewServerName("");
      setCurlRequest("");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteServer = async serverId => {
    try {
      await axios.delete(`http://localhost:8000/servers/${serverId}`);
      setServers(prevServers =>
        prevServers.filter(server => server.id !== serverId)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    try {
      const server = servers.find(server => server.id === selectedServer);
      if (!server) {
        throw new Error("Server not found");
      }

      const response = await axios.post(
        `http://localhost:8000/v1/chat/completions`,
        {
          serverId: selectedServer,
          payload: {
            sender: "User",
            text: message,
            current: true,
            isCreatedByUser: true,
            parentMessageId: "00000000-0000-0000-0000-000000000000",
            conversationId: null,
            messageId: "e595d44b-85d5-4528-bb36-248be36e0ae3",
            overrideParentMessageId: null,
            endpoint: "openAI",
            model: selectedModel,
            chatGptLabel: null,
            promptPrefix: null,
            temperature: 1,
            top_p: 1,
            presence_penalty: 0,
            frequency_penalty: 0,
            token: null,
          },
        }
      );

      setResponse(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const executeCurlRequest = async () => {
    try {
      const response = await axios.post("http://localhost:8000/curl", {
        request: curlRequest,
      });
      setResponse(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const messageHandler = event => {
    const parsedMessage = JSON.parse(event.data);
    if (
      parsedMessage.message &&
      parsedMessage.message.sender === "ChatGPT"
    ) {
      const formattedResponse = parsedMessage.text;
      setResponse(formattedResponse);
    }
  };

  const updateServerCode = async (serverId, code) => {
    try {
      await axios.put(`http://localhost:8000/servers/${serverId}`, {
        code: code,
      });
      const updatedServers = servers.map(server => {
        if (server.id === serverId) {
          return { ...server, code: code };
        }
        return server;
      });
      setServers(updatedServers);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardContainer>
      <SidebarContainer>
        <SidebarHeading>Dashboard</SidebarHeading>
        <SidebarList>
          <SidebarListItem>Overview</SidebarListItem>
          <SidebarListItem>Settings</SidebarListItem>
          <SidebarListItem>Logs</SidebarListItem>
          <SidebarListItem>Analytics</SidebarListItem>
        </SidebarList>
      </SidebarContainer>
      <ContentContainer>
        <SectionHeading>Server List</SectionHeading>
        <ServerListContainer>
  {servers.map(server => (
    <div key={server.id}>
      <ServerItem>
        <input
          type="text"
          value={server.name}
          onChange={e => {
            const updatedServers = servers.map(s => {
              if (s.id === server.id) {
                return { ...s, name: e.target.value };
              }
              return s;
            });
            setServers(updatedServers);
          }}
        />
        <Button onClick={() => deleteServer(server.id)}>Delete</Button>
      </ServerItem>
      <ServerCodeContainer>
  <pre>
    <strong>Name:</strong> {server.name} <br />
    <strong>URL:</strong> {server.url} <br />
    <strong>Headers:</strong> <br />
    {Object.entries(server.headers).map(([key, value]) => (
      <span key={key}>
        {key}: {value} <br />
      </span>
    ))}
    <hr />
    {server.code}
  </pre>
  <textarea
    value={server.code}
    onChange={e => {
      const updatedServers = servers.map(s => {
        if (s.id === server.id) {
          return { ...s, code: e.target.value };
        }
        return s;
      });
      setServers(updatedServers);
    }}
  />
  <Button
    onClick={() => updateServerCode(server.id, server.code)}
    disabled={!server.code}
  >
    Save Code
  </Button>
</ServerCodeContainer>
    </div>
  ))}
  {servers.map(server => (
    <ServerItem key={server.id}>
      <input
        type="text"
        value={server.name}
        onChange={e => {
          const updatedServers = servers.map(s => {
            if (s.id === server.id) {
              return { ...s, name: e.target.value };
            }
            return s;
          });
          setServers(updatedServers);
        }}
      />
      <Button onClick={() => deleteServer(server.id)}>Delete</Button>
    </ServerItem>
  ))}
  <ServerItem>
    <input
      type="text"
      value={newServerName}
      onChange={e => setNewServerName(e.target.value)}
      placeholder="Enter server name"
    />
    <textarea
      value={curlRequest}
      onChange={e => setCurlRequest(e.target.value)}
      placeholder="Enter server code"
    />
  </ServerItem>
</ServerListContainer>
        <Button onClick={addServer} disabled={!newServerName || !curlRequest}>
          Add Server
        </Button>
        <SectionHeading>Message</SectionHeading>
        <ServerItem>
          <Select
            value={selectedServer}
            onChange={e => setSelectedServer(e.target.value)}
          >
            <option value="">Choose a server</option>
            {servers.map(server => (
              <option key={server.id} value={server.id}>
                {server.name}
              </option>
            ))}
          </Select>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <Select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
          >
            <option value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</option>
            <option value="gpt-4">gpt-4</option>
          </Select>
          <Button onClick={sendMessage} disabled={!selectedServer || !message}>
            Send Message
          </Button>
        </ServerItem>
        <ServerItem>
          <input
            type="text"
            value={curlRequest}
            onChange={e => setCurlRequest(e.target.value)}
            placeholder="Enter curl request"
          />
          <Button onClick={executeCurlRequest} disabled={!curlRequest}>
            Execute Request
          </Button>
        </ServerItem>
        {response && (
          <>
            <SectionHeading>Response</SectionHeading>
            <StyledTextarea value={response} readOnly />
          </>
        )}
      </ContentContainer>
    </DashboardContainer>
  );
}

export default Panel;