import React from 'react';
import Panel from './components/Panel';
import styled from 'styled-components';

const AppContainer = styled.div`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;

function App() {
  return (
    <AppContainer>
      <Title>The Panel</Title>
      <Panel />
    </AppContainer>
  );
}

export default App;