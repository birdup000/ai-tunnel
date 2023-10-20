import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";


const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 20px;
  background-color: #000000;
  padding: 40px;
`;

const SidebarContainer = styled.nav`
  background-color: #001d3d;
  color: #ffffff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-right: 2px solid #29abe2;
  border-radius: 16px;
`;

const SidebarHeading = styled.h1`
  font-size: 32px;
  margin-bottom: 30px;
  color: #ffffff;
  font-family: "Montserrat", sans-serif;
`;

const SidebarList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SidebarListItem = styled.li`
  font-size: 24px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: color 0.3s;
  font-family: "Montserrat", sans-serif;

  &:hover {
    color: #29abe2;
  }

  &.selected {
    color: #29abe2;
    font-weight: bold;
  }
`;

const ContentContainer = styled.div`
  background-color: #0a0f22;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
`;

const SectionHeading = styled.h2`
  margin-bottom: 30px;
  font-size: 28px;
  color: #ffffff;
  font-family: "Montserrat", sans-serif;
`;

const ServerListContainer = styled.div`
  margin-bottom: 40px;
`;

const ServerItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const ServerInput = styled.input`
  margin-right: 10px;
  padding: 10px;
  border: 2px solid #ffffff;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  background-color: transparent;
  color: #ffffff;
  font-family: "Montserrat", sans-serif;

  &:focus {
    border-color: #29abe2;
    box-shadow: 0 0 5px rgba(41, 171, 226, 0.2);
  }
`;

const ServerCodeContainer = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background-color: #0a0f22;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  overflow: auto;
  color: white;
  max-width: 1000px;
`;

const ServerCode = styled.pre`
  font-family: "Roboto Mono", monospace;
  padding: 10px;
  font-size: 16px;
  color: #ffffff;
  background-color: #000000;
  white-space: pre-wrap;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  height: 200px;
  background-color: #0a0f22;
  border: 2px solid #ffffff;
  padding: 10px;
  font-family: "Roboto Mono", monospace;
  color: #ffffff;
  font-size: 14px;
  resize: none;
`;

const Select = styled.select`
  margin-right: 10px;
  padding: 10px;
  border: 2px solid #ffffff;
  border-radius: 4px;
  font-size: 16px;
  color: #ffffff;
  background-color: #0a0f22;
  font-family: "Montserrat", sans-serif;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #29abe2;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s;
  font-family: "Montserrat", sans-serif;

  &:hover {
    background-color: #1e94cc;
  }

  &:disabled {
    background-color: #555555;
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
    const eventSource = new EventSource("https://ai-tunnel-backend.birdup.link/v1/chat/events");

    eventSource.addEventListener("message", messageHandler);

    return () => {
      eventSource.removeEventListener("message", messageHandler);
      eventSource.close();
    };
  }, []);

  const fetchServerList = async () => {
    try {
      const response = await axios.get("https://ai-tunnel-backend.birdup.link/servers");
      setServers(response.data.servers);
    } catch (error) {
      console.error(error);
    }
  };

  const addServer = async () => {
    try {
      const response = await axios.post("https://ai-tunnel-backend.birdup.link/servers", {
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
      await axios.delete(`https://ai-tunnel-backend.birdup.link/servers/${serverId}`);
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
        `https://ai-tunnel-backend.birdup.link/v1/chat/completions`,
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
      const response = await axios.post("https://ai-tunnel-backend.birdup.link/curl", {
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
      await axios.put(`https://ai-tunnel-backend.birdup.link/servers/${serverId}`, {
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
