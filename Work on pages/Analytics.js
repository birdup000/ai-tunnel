import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Analytics = () => {
  const [requests, setRequests] = useState([]);
  const [responseTime, setResponseTime] = useState([]);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [mostFrequentErrors, setMostFrequentErrors] = useState([]);
  const [newServersCount, setNewServersCount] = useState(0);
  const [deletedServersCount, setDeletedServersCount] = useState(0);
  const [chatCompletionsCount, setChatCompletionsCount] = useState(0);
  const [curlRequestsCount, setCurlRequestsCount] = useState(0);
  const [averageResponseTime, setAverageResponseTime] = useState([]);
  const [uptime, setUptime] = useState('');
  const [downtime, setDowntime] = useState('');
  const [frequentlyAccessedServers, setFrequentlyAccessedServers] = useState([]);
  const [frequentlyUsedHeaders, setFrequentlyUsedHeaders] = useState([]);
  const [clientRequests, setClientRequests] = useState([]);
  const [cpuUsage, setCpuUsage] = useState('');
  const [memoryUsage, setMemoryUsage] = useState('');
  const [networkTraffic, setNetworkTraffic] = useState('');
  const [bandwidthConsumption, setBandwidthConsumption] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const requestsResponse = await axios.get('/api/analytics/requests');
      const responseTimeResponse = await axios.get('/api/analytics/response-time');
      const successCountResponse = await axios.get('/api/analytics/success-count');
      const errorCountResponse = await axios.get('/api/analytics/error-count');
      const mostFrequentErrorsResponse = await axios.get('/api/analytics/most-frequent-errors');
      const newServersCountResponse = await axios.get('/api/analytics/new-servers-count');
      const deletedServersCountResponse = await axios.get('/api/analytics/deleted-servers-count');
      const chatCompletionsCountResponse = await axios.get('/api/analytics/chat-completions-count');
      const curlRequestsCountResponse = await axios.get('/api/analytics/curl-requests-count');
      const averageResponseTimeResponse = await axios.get('/api/analytics/average-response-time');
      const uptimeResponse = await axios.get('/api/analytics/uptime');
      const downtimeResponse = await axios.get('/api/analytics/downtime');
      const frequentlyAccessedServersResponse = await axios.get('/api/analytics/frequently-accessed-servers');
      const frequentlyUsedHeadersResponse = await axios.get('/api/analytics/frequently-used-headers');
      const clientRequestsResponse = await axios.get('/api/analytics/client-requests');
      const cpuUsageResponse = await axios.get('/api/analytics/cpu-usage');
      const memoryUsageResponse = await axios.get('/api/analytics/memory-usage');
      const networkTrafficResponse = await axios.get('/api/analytics/network-traffic');
      const bandwidthConsumptionResponse = await axios.get('/api/analytics/bandwidth-consumption');

      setRequests(requestsResponse.data);
      setResponseTime(responseTimeResponse.data);
      setSuccessCount(successCountResponse.data);
      setErrorCount(errorCountResponse.data);
      setMostFrequentErrors(mostFrequentErrorsResponse.data);
      setNewServersCount(newServersCountResponse.data);
      setDeletedServersCount(deletedServersCountResponse.data);
      setChatCompletionsCount(chatCompletionsCountResponse.data);
      setCurlRequestsCount(curlRequestsCountResponse.data);
      setAverageResponseTime(averageResponseTimeResponse.data);
      setUptime(uptimeResponse.data);
      setDowntime(downtimeResponse.data);
      setFrequentlyAccessedServers(frequentlyAccessedServersResponse.data);
      setFrequentlyUsedHeaders(frequentlyUsedHeadersResponse.data);
      setClientRequests(clientRequestsResponse.data);
      setCpuUsage(cpuUsageResponse.data);
      setMemoryUsage(memoryUsageResponse.data);
      setNetworkTraffic(networkTrafficResponse.data);
      setBandwidthConsumption(bandwidthConsumptionResponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="analytics-container">
      <h1>Analytics Data</h1>

      <div className="section">
        <h2>Requests</h2>
        <ul>
          {requests.map((request, index) => (
            <li key={index}>{request.endpoint}: {request.count} requests</li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2>Response Time</h2>
        <ul>
          {responseTime.map((data, index) => (
            <li key={index}>{data.endpoint}: {data.averageTime} ms</li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2>Success and Error Count</h2>
        <p>Successful requests: {successCount}</p>
        <p>Error count: {errorCount}</p>
      </div>

      <div className="section">
        <h2>Most Frequent Errors</h2>
        <ul>
          {mostFrequentErrors.map((error, index) => (
            <li key={index}>{error.error}: {error.count} occurrences</li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2>New and Deleted Servers</h2>
        <p>New servers added: {newServersCount}</p>
        <p>Servers deleted: {deletedServersCount}</p>
      </div>

      <div className="section">
        <h2>Chat Completions and Curl Requests</h2>
        <p>Chat completions made: {chatCompletionsCount}</p>
        <p>Curl requests made: {curlRequestsCount}</p>
      </div>

      <div className="section">
        <h2>Average Response Time</h2>
        <ul>
          {averageResponseTime.map((data, index) => (
            <li key={index}>{data.endpoint}: {data.averageTime} ms</li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2>Server Uptime and Downtime</h2>
        <p>Uptime: {uptime}</p>
        <p>Downtime: {downtime}</p>
      </div>

      <div className="section">
        <h2>Frequently Accessed Servers</h2>
        <ul>
          {frequentlyAccessedServers.map((server, index) => (
            <li key={index}>{server.name}: {server.count} times accessed</li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2>Frequently Used Headers</h2>
        <ul>
          {frequentlyUsedHeaders.map((header, index) => (
            <li key={index}>{header.header}: {header.count} times used</li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2>Client Requests</h2>
        <ul>
          {clientRequests.map((client, index) => (
            <li key={index}>{client.ip}: {client.count} requests</li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2>CPU and Memory Usage</h2>
        <p>CPU Usage: {cpuUsage}</p>
        <p>Memory Usage: {memoryUsage}</p>
      </div>

      <div className="section">
        <h2>Network Traffic and Bandwidth Consumption</h2>
        <p>Network Traffic: {networkTraffic}</p>
        <p>Bandwidth Consumption: {bandwidthConsumption}</p>
      </div>
    </div>
  );
};

export default Analytics;