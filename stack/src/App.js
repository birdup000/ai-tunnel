import React from 'react';
import Panel from './components/Panel';
import styled from 'styled-components';

const AppContainer = styled.div`
  background-color: #57536e;
`;


function App() {
  return (
    <AppContainer>
      <Panel />
    </AppContainer>
  );
}

export default App;